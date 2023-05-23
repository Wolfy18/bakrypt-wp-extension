// Import SCSS entry file so that webpack picks up changes
import './index.scss';
import * as ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import renderTransactionModal from './components/transactionModal';
import renderLaunchpadModal from './components/launchpadModal';
import showSpinner from './components/spinner';
import BakryptApiInterface from './api/interfaces';

const getData = () => {
	const asset = new FormData();

	const inputs = [
		'bk_token_uuid',
		'bk_token_policy',
		'bk_token_fingerprint',
		'bk_token_asset_name',
		'bk_token_image',
		'bk_token_name',
		'bk_token_amount',
		'bk_token_status',
		'bk_token_transaction',
		'bk_token_json',
		'bk_att_token_image',
		'bk_token_json',
	];

	inputs.map((i) => {
		const input = document.querySelector(`#${i}`);
		if (input) {
			asset.set(i, input.value);
		}
	});

	return asset;
};

const setData = (asset, tx) => {
	const inputs = [
		'bk_token_uuid',
		'bk_token_policy',
		'bk_token_fingerprint',
		'bk_token_asset_name',
		'bk_token_image',
		'bk_token_name',
		'bk_token_amount',
		'bk_token_status',
		'bk_token_transaction',
		'bk_token_json',
	];

	inputs.map((i) => {
		const input = document.querySelector(`#${i}`);
		if (input && asset) {
			switch (i) {
				case 'bk_token_uuid':
					input.value = asset.uuid;
					break;
				case 'bk_token_policy':
					input.value = tx.policy_id;
					break;
				case 'bk_token_fingerprint':
					input.value = asset.fingerprint;
					break;
				case 'bk_token_asset_name':
					input.value = asset.asset_name;
					break;
				case 'bk_token_name':
					input.value = asset.name;
					break;
				case 'bk_token_image':
					input.value = asset.image;
					break;
				case 'bk_token_amount':
					input.value = asset.amount;
					break;
				case 'bk_token_status':
					input.value = tx.status;
					break;
				case 'bk_token_transaction':
					input.value = tx.uuid;
					break;
				case 'bk_token_json':
					input.value = JSON.stringify(tx.metadata);
					break;
				default:
					break;
			}
		}

		return i;
	});
};

jQuery(document).ready(function ($) {
	jQuery('a#bk_token_image_media_manager').click(function (e) {
		e.preventDefault();
		var imageFrame;
		if (imageFrame) {
			imageFrame.open();
		}
		// Define imageFrame as wp.media object
		imageFrame = wp.media({
			title: 'Select Media',
			multiple: false,
			library: {
				type: 'image',
			},
		});
		imageFrame.on('close', function () {
			// On close, get selections and save to the hidden input
			// plus other AJAX stuff to refresh the image preview
			var selection = imageFrame.state().get('selection');
			var gallery_ids = new Array();
			var my_index = 0;
			selection.each(function (attachment) {
				gallery_ids[my_index] = attachment['id'];
				my_index++;
			});
			var ids = gallery_ids.join(',');
			if (ids.length === 0) return true; //if closed withput selecting an image
			jQuery('input#bk_att_token_image').val(ids);
			refreshImages(ids);
		});

		imageFrame.on('open', function () {
			// On open, get the id from the hidden input
			// and select the appropiate images in the media manager
			var selection = imageFrame.state().get('selection');
			var ids = jQuery('input#bk_att_token_image').val().split(',');
			ids.forEach(function (id) {
				var attachment = wp.media.attachment(id);
				attachment.fetch();
				selection.add(attachment ? [attachment] : []);
			});
		});

		imageFrame.open();
	});
});

// Ajax request to refresh the image preview
function refreshImages(the_id) {
	var data = {
		action: 'product_token_get_image',
		id: the_id,
	};
	jQuery.get(ajaxurl, data, function (response) {
		if (response.success === true) {
			jQuery('#preview_bk_att_token_image').replaceWith(
				response.data.image
			);

			jQuery('#bk_att_token_image_ipfs').val(
				jQuery('#preview_bk_att_token_image').data('ipfs')
			);
		}
	});
}

const updateRecord = async () => {
	const id = jQuery('#product_id').val();
	const nonce = jQuery('#bk_nonce').val();

	const body = getData();

	body.set('product_id', id);
	body.set('bk_nonce', nonce);
	body.set('action', 'bk_update_record');

	const blockchainDataWrapper = document.querySelector(
		'#blockchain_product_data'
	);
	const spinner = document.createElement('div');
	spinner.id = 'spinner';

	ReactDOM.render(showSpinner(), spinner);
	blockchainDataWrapper.appendChild(spinner);

	jQuery.ajax({
		url: ajaxurl,
		type: 'POST',
		data: Object.fromEntries(body),
		success: (response) => {
			Swal.fire({
				title: 'Good!',
				text: response.data,
				icon: 'success',
			});
			blockchainDataWrapper.removeChild(spinner);
		},
		error: (error) => {
			Swal.fire({
				title: 'Error',
				text: error.responseJSON.data,
				icon: 'error',
			});
			blockchainDataWrapper.removeChild(spinner);
		},
	});
};

const deleteRecord = async (e) => {
	e.preventDefault();

	Swal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#d33',
		cancelButtonColor: '#c7c7c9',
		confirmButtonText: 'Yes, delete it!',
	}).then((result) => {
		/* Read more about isConfirmed, isDenied below */
		if (result.isConfirmed) {
			const id = jQuery('#product_id').val();
			const nonce = jQuery('#bk_nonce').val();

			const body = new FormData();

			body.set('product_id', id);
			body.set('bk_nonce', nonce);
			body.set('action', 'bk_delete_record');

			const blockchainDataWrapper = document.querySelector(
				'#blockchain_product_data'
			);
			const spinner = document.createElement('div');
			spinner.id = 'spinner';

			ReactDOM.render(showSpinner(), spinner);
			blockchainDataWrapper.appendChild(spinner);

			jQuery.ajax({
				url: ajaxurl,
				type: 'POST',
				data: Object.fromEntries(body),
				success: () => {
					location.reload();
					blockchainDataWrapper.removeChild(spinner);
				},
				error: (error) => {
					Swal.fire({
						title: 'Error',
						text: error.responseJSON.data,
						icon: 'error',
					});
					blockchainDataWrapper.removeChild(spinner);
				},
			});
		} else if (result.isDenied) {
			Swal.fire('Changes are not saved', '', 'info');
		}
	});
};

jQuery(document).ready(function ($) {
	$('body').on('click', '#doaction', async (e) => {
		e.preventDefault();

		const selectedProducts = []; // Get the selected product IDs

		// Iterate over each row in the WP-List-Table
		$('.wp-list-table tbody tr.entry').each(function () {
			const checkbox = $(this).find('input[type="checkbox"]');

			// Check if the checkbox is selected
			if (checkbox.prop('checked')) {
				// Retrieve the product ID from the row data or attributes
				const productId = checkbox.val();

				// Store the selected product ID
				selectedProducts.push(productId);
			}
		});

		if (!selectedProducts.length) return;

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'mint_bulk_action',
				product_ids: selectedProducts,
			},
			success: (bulkResp) => {
				// Process the AJAX bulkResp
				const missingImgs = bulkResp.data.filter(
					(i) => i.image === '' || !i.image
				);
				if (missingImgs.length) {
					$.ajax({
						url: ajaxurl,
						type: 'POST',
						data: {
							action: 'upload_ipfs_bulk_action',
							product_ids: missingImgs.map((i) => i.product_id),
						},
						success: (ipfsRes) => {
							// Process the AJAX ipfsRes
							console.log(ipfsRes);
							console.log(bulkResp);

							const collectionFinal = bulkResp.data.map((i) => {
								const elem = { ...i };

								if (
									ipfsRes.data
										.map((j) => j.product_id)
										.includes(i.product_id)
								) {
									elem.image = ipfsRes.data.filter(
										(j) => j.product_id === i.product_id
									)[0].image;
								}
								return elem;
							});

							console.log(collectionFinal);
						},
						error: (xhr, status, error) => {
							// Handle AJAX error
							console.error(error);
						},
					});
				} else {
					console.log(
						bulkResp.data,
						' is the collection!!! -<<<<<<<<<<< '
					);
				}
			},
			error: (xhr, status, error) => {
				// Handle AJAX error
				console.error(error);
			},
		});
	});
});

const init = () => {
	// Render Modal if section exists
	const wrapper = document.querySelector('#blockchain_product_data');

	if (!wrapper) return;

	const token = wrapper.querySelector('.btn-action').dataset.token;
	const testnet = wrapper.querySelector('.btn-action').attributes.testnet;

	const mintModalContainer = wrapper
		.querySelector('.btn-action')
		.querySelector('.mint');
	if (mintModalContainer) {
		const modal = document.createElement('div');

		const setInitial = () => {
			if (!document.querySelector('#bk_att_token_image_ipfs')) {
				alert('Please select a Blockchain token image');
				return;
			}
			const initialName = document.querySelector('#title').value;
			const initialImage = document.querySelector(
				'#bk_att_token_image_ipfs'
			).value;
			if (!initialImage || !initialImage.length) {
				alert('Please select a Blockchain token image');
				return;
			}

			const asset = {
				blockchain: 'ada',
				name: initialName,
				asset_name: initialName,
				image: initialImage,
				amount: 1,
				description: '',
			};

			return JSON.stringify([asset]);
		};

		ReactDOM.render(
			renderLaunchpadModal(token, setInitial, (response) => {
				if (response.collection && response.transaction) {
					setData(response.collection[0], response.transaction);

					// Hide/show action btns
					wrapper
						.querySelector('.btn-action')
						.querySelectorAll('.form-field')
						.forEach((i) => (i.style.display = 'block'));
					wrapper
						.querySelector('.btn-action')
						.querySelector('.form-field.mint').style.display =
						'none';

					updateRecord();
				}
			}),
			modal
		);
		mintModalContainer.appendChild(modal);
	}

	const helper = new BakryptApiInterface(
		testnet ? `https://testnet.bakrypt.io` : `https://bakrypt.io`,
		token
	);

	const syncAsset = async (e) => {
		e.preventDefault();

		const blockchainDataWrapper = document.querySelector(
			'#blockchain_product_data'
		);
		const spinner = document.createElement('div');
		spinner.id = 'spinner';

		ReactDOM.render(showSpinner(), spinner);
		blockchainDataWrapper.appendChild(spinner);

		const tokenUuid = document.querySelector('#bk_token_uuid').value;
		const asset = await helper.getAsset(tokenUuid);

		// Valid asset
		if (!asset) {
			Swal.fire({
				title: 'Error',
				text: 'Unable to load asset from remote source.',
				icon: 'error',
			});

			blockchainDataWrapper.removeChild(spinner);
			return;
		}

		let tx;
		// Get transaction if the transaction is not found within the asset.
		if (asset && asset.transaction && !asset.transaction.uuid) {
			tx = await helper.getTransaction(asset.transaction);
		} else if (asset && asset.transaction) {
			tx = asset.transaction;
		}

		setData(asset, tx);

		updateRecord();

		blockchainDataWrapper.removeChild(spinner);
	};

	// Sync Btn
	const syncBtn = document.querySelector('#sync-asset-btn');
	if (syncBtn) {
		syncBtn.removeEventListener('click', syncAsset);
		syncBtn.addEventListener('click', syncAsset);
	}

	const viewTransaction = async () => {
		const blockchainDataWrapper = document.querySelector(
			'#blockchain_product_data'
		);
		const spinner = document.createElement('div');
		spinner.id = 'spinner';

		ReactDOM.render(showSpinner(), spinner);
		blockchainDataWrapper.appendChild(spinner);

		const tokenUuid = document.querySelector('#bk_token_transaction').value;
		const tx = await helper.getTransaction(tokenUuid);

		blockchainDataWrapper.removeChild(spinner);

		return tx;
	};

	const transactionModalContainer = wrapper
		.querySelector('.btn-action')
		.querySelector('.view-transaction');
	if (transactionModalContainer) {
		const modal = document.createElement('div');
		ReactDOM.render(renderTransactionModal(viewTransaction, []), modal);
		transactionModalContainer.appendChild(modal);
	}

	// Delete action
	wrapper
		.querySelector('#delete_token')
		.removeEventListener('click', deleteRecord);
	wrapper
		.querySelector('#delete_token')
		.addEventListener('click', deleteRecord);
};

window.removeEventListener('load', init, true);
window.addEventListener('load', init, true);
