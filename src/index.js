// Import SCSS entry file so that webpack picks up changes
import './index.css';
import { createRoot } from 'react-dom';
import Swal from 'sweetalert2';
import renderTransactionModal from './components/transactionModal';
import renderLaunchpadModal from './components/launchpadModal';
import BakryptApiInterface from './api/interfaces';
import client from './api/client';
import { injectSpinner, removeSpinner, getData, setData } from './utils';

const updateRecord = async () => {
	const id = document.querySelector('#post_id').value;
	const body = getData();
	injectSpinner();
	try {
		const data = await client.put(`posts/${id}`, body);

		if (data.status !== 200) throw 'Unable to update post.';

		Swal.fire({
			title: 'Good!',
			text: data.responseJSON,
			icon: 'success',
		});
	} catch (error) {
		Swal.fire({
			title: 'Error',
			text: error,
			icon: 'error',
		});
	}
	removeSpinner();
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
	}).then(async (result) => {
		/* Read more about isConfirmed, isDenied below */
		if (result.isConfirmed) {
			const id = document.querySelector('#post_id').value;

			injectSpinner();
			try {
				const data = await client.delete(`posts/${id}`);

				if (data.status !== 200)
					throw 'Unable to delete token information.';

				Swal.fire({
					title: 'Good!',
					text: data.responseJSON,
					icon: 'The post was reset. The page will reload automatically.',
				});

				window.location.reload();
			} catch (error) {
				Swal.fire({
					title: 'Error',
					text: error,
					icon: 'error',
				});
			}
			removeSpinner();
		} else if (result.isDenied) {
			Swal.fire('Changes are not saved', '', 'info');
		}
	});
};

// post List
jQuery(document).ready(function ($) {
	const loadForm = async (initialData) => {
		let accessToken;
		let testnet;
		try {
			const accessTokenRequest = await client.post(`auth/token`);

			if (accessTokenRequest.status !== 200)
				throw 'Unable access Bakrypt API.';

			accessToken = accessTokenRequest.data.data.access_token;
			testnet = accessTokenRequest.data.testnet;
		} catch (error) {
			Swal.fire({
				title: 'Error',
				text: error,
				icon: 'error',
			});
		}

		const wrapper = document.querySelector('#posts-filter');

		if (!wrapper) return;

		const mintModalContainer = wrapper;

		const modal = document.createElement('div');

		const setInitial = () => {
			const data = initialData.map((i) => {
				return {
					asset_name: i.name,
					name: i.name,
					image: i.image,
					amount: 1,
					blockchain: 'ada',
					description: '',
				};
			});

			return JSON.stringify(data);
		};
		const handleCallback = async (response) => {
			if (response.collection && response.transaction) {
				// Update all records
				const updateRecords = response.collection.map((i, idx) => {
					return {
						...initialData[idx],
						...i,
					};
				});

				try {
					const updatePostRequest = await client.put(`posts`, {
						posts: updateRecords,
					});

					if (updatePostRequest.status !== 200)
						throw 'Unable to update posts.';

					Swal.fire({
						title: 'Posts were updated',
						icon: 'success',
						text: 'Visit any post for more information about the transaction',
					}).then(() => {
						window.location.reload();
					});
				} catch (error) {
					Swal.fire({
						title: 'Error',
						text: error,
						icon: 'error',
					});
				}
			}
		};
		const rootElement = createRoot(modal);
		rootElement.render(
			renderLaunchpadModal(
				{
					accessToken,
					testnet,
					open: true,
					showButton: false,
				},
				setInitial,
				handleCallback
			)
		);

		mintModalContainer.appendChild(modal);
	};

	const startMinting = async (selectedPosts) => {
		injectSpinner();

		Swal.fire({
			title: 'Prepping data',
			icon: 'info',
			timer: 6000,
			showConfirmButton: false,
			position: 'top-end', // Adjust position as needed
			toast: true, // Enables the toastr-style appearance
			showClass: {
				popup: 'swal2-noanimation',
				backdrop: 'swal2-noanimation',
			},
			hideClass: {
				popup: '',
				backdrop: '',
			},
			customClass: {
				popup: 'custom-toast-position',
				container: 'custom-toast-position-container',
				actions: 'custom-toast-position-actions',
			},
		});
		let missingImgs;
		let fetchIPFSImagesReq;
		let uploadedImages = [];
		try {
			fetchIPFSImagesReq = await client.post(`posts/ipfs`, {
				post_ids: selectedPosts,
			});

			if (fetchIPFSImagesReq.status !== 200)
				throw 'Unable to fetch images.';

			missingImgs = fetchIPFSImagesReq.data.data.filter(
				(i) => i.image === '' || !i.image
			);
		} catch (error) {
			Swal.fire({
				title: 'Error',
				text: error,
				icon: 'error',
				timer: 6000,
				showConfirmButton: false,
				position: 'top-end', // Adjust position as needed
				toast: true, // Enables the toastr-style appearance
				showClass: {
					popup: 'swal2-noanimation',
					backdrop: 'swal2-noanimation',
				},
				hideClass: {
					popup: '',
					backdrop: '',
				},
				customClass: {
					popup: 'custom-toast-position',
					container: 'custom-toast-position-container',
					actions: 'custom-toast-position-actions',
				},
			});
		}

		if (missingImgs.length) {
			Swal.fire({
				title: 'Uploading Images to IPFS',
				icon: 'info',
				timer: 6000,
				showConfirmButton: false,
				position: 'top-end', // Adjust position as needed
				toast: true, // Enables the toastr-style appearance
				showClass: {
					popup: 'swal2-noanimation',
					backdrop: 'swal2-noanimation',
				},
				hideClass: {
					popup: '',
					backdrop: '',
				},
				customClass: {
					popup: 'custom-toast-position',
					container: 'custom-toast-position-container',
					actions: 'custom-toast-position-actions',
				},
			});

			try {
				const uploadImagesReq = await client.put(`posts/ipfs`, {
					post_ids: missingImgs.map((i) => i.post_id),
				});

				if (uploadImagesReq.status !== 200)
					throw 'Unable to upload images.';

				uploadedImages = uploadImagesReq.data.data;
			} catch (error) {
				Swal.fire({
					title: 'Error',
					text: error,
					icon: 'error',
					timer: 6000,
					showConfirmButton: false,
					position: 'top-end', // Adjust position as needed
					toast: true, // Enables the toastr-style appearance
					showClass: {
						popup: 'swal2-noanimation',
						backdrop: 'swal2-noanimation',
					},
					hideClass: {
						popup: '',
						backdrop: '',
					},
					customClass: {
						popup: 'custom-toast-position',
						container: 'custom-toast-position-container',
						actions: 'custom-toast-position-actions',
					},
				});
			}
		}

		// Process the AJAX ipfsRes
		const collectionFinal = fetchIPFSImagesReq.data.data.map((i) => {
			const elem = { ...i };

			if (
				uploadedImages.map((j) => j.post_id).includes(i.post_id)
			) {
				elem.image = uploadedImages.filter(
					(j) => j.post_id === i.post_id
				)[0].image;
			}
			return elem;
		});

		loadForm(collectionFinal);

		removeSpinner();
	};

	// Mint bulk action
	$('#posts-filter').on('click', '#doaction', async (e) => {
		if ($('#bulk-action-selector-top').val() === 'mint') {
			e.preventDefault();
			const selectedPosts = []; // Get the selected post IDs

			// Iterate over each row in the WP-List-Table
			$('.wp-list-table tbody tr').each(function () {
				const checkbox = $(this).find('input[type="checkbox"]');

				// Check if the checkbox is selected
				if (checkbox.prop('checked')) {
					// Retrieve the post ID from the row data or attributes
					const postId = checkbox.val();

					// Store the selected post ID
					selectedPosts.push(postId);
				}
			});

			if (!selectedPosts.length) {
				Swal.fire({ title: 'Please select posts', icon: 'info' });
				return;
			}

			// Add check for existing posts in bak
			// if found then show alert
			Swal.fire({
				title: 'Are you sure?',
				text: 'This action is irreversible! Please note that any blockchain-related data will be overwritten',
				icon: 'question',
				showCancelButton: true,
				cancelButtonColor: '#c7c7c9',
				confirmButtonText: 'Yes, mint it!',
			}).then((result) => {
				/* Read more about isConfirmed, isDenied below */
				if (result.isConfirmed) {
					startMinting(selectedPosts);
				} else if (result.isDenied) {
					Swal.fire('Changes are not saved', '', 'info');
				}
			});
		}
	});
});

const init = async () => {
	// Render Modal if section exists
	const wrapper = document.querySelector('#blockchain_post_data');

	if (!wrapper) return;

	const accessToken = wrapper.querySelector('.btn-action').dataset.token;
	const testnet = wrapper.querySelector('.btn-action').attributes.testnet;

	const mintModalContainer = wrapper
		.querySelector('.btn-action')
		.querySelector('.mint');

	if (mintModalContainer) {
		const modal = document.createElement('div');

		const setInitial = () => {
			if (!document.querySelector('#bk_att_token_image_ipfs')) {
				return;
			}
			const initialName = document.querySelector('#title').value;
			const initialImage = document.querySelector(
				'#bk_att_token_image_ipfs'
			).value;

			const asset = {
				blockchain: 'ada',
				name: initialName,
				asset_name: initialName.replace(/\s/g, ''),
				image: initialImage,
				amount: 1,
				description: '',
			};

			return JSON.stringify([asset]);
		};

		const rootElement = createRoot(modal);
		rootElement.render(
			renderLaunchpadModal(
				{
					accessToken,
					testnet,
				},
				setInitial,
				(response) => {
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
				}
			)
		);

		mintModalContainer.appendChild(modal);
	}

	const helper = new BakryptApiInterface(
		testnet ? `https://testnet.bakrypt.io` : `https://bakrypt.io`,
		accessToken
	);

	const syncAsset = async (e) => {
		e.preventDefault();

		injectSpinner();

		const tokenUuid = document.querySelector('#bk_token_uuid').value;
		const asset = await helper.getAsset(tokenUuid);

		// Valid asset
		if (!asset) {
			Swal.fire({
				title: 'Error',
				text: 'Unable to load asset from remote source.',
				icon: 'error',
			});

			removeSpinner();
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

		removeSpinner();
	};

	// Sync Btn
	const syncBtn = document.querySelector('#sync-asset-btn');
	if (syncBtn) {
		syncBtn.removeEventListener('click', syncAsset);
		syncBtn.addEventListener('click', syncAsset);
	}

	const viewTransaction = async () => {
		injectSpinner();

		const tokenUuid = document.querySelector('#bk_token_transaction').value;
		const tx = await helper.getTransaction(tokenUuid);

		removeSpinner();

		return tx;
	};

	const transactionModalContainer = wrapper
		.querySelector('.btn-action')
		.querySelector('.view-transaction');

	if (transactionModalContainer) {
		const modal = document.createElement('div');
		const rootElement = createRoot(modal);
		rootElement.render(
			renderTransactionModal(
				{
					accessToken,
					testnet,
				},
				viewTransaction,
				[]
			)
		);
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
