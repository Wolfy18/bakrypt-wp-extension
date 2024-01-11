import { createRoot } from 'react-dom';
import { Spinner } from '@wordpress/components';

const injectSpinner = () => {
	const spinnerWrapper =
		document.querySelector('#blockchain_post_data') ||
		document.querySelector('#posts-filter');
	const spinner = document.createElement('div');
	spinner.id = 'spinner';

	const rootElement = createRoot(spinner);
	rootElement.render(<Spinner />);

	spinnerWrapper.appendChild(spinner);
};
const removeSpinner = () => {
	const spinnerWrapper =
		document.querySelector('#blockchain_post_data') ||
		document.querySelector('#posts-filter');
	const spinner = spinnerWrapper.querySelector('#spinner');
	spinnerWrapper.removeChild(spinner);
};

const getData = () => {
	const asset = {};

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
			// asset.set(i, input.value);
			asset[i] = input.value;
		}

		return i;
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

export { injectSpinner, removeSpinner, getData, setData };
