import axios from 'axios';

const client = axios.create({
	baseURL: `${ajaxurl.replace('wp-admin/admin-ajax.php', '')}${
		wpApiSettings.rest.root
	}`,
	responseType: 'json',
	responseEncoding: 'utf8',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		'X-WP-Nonce': wpApiSettings.rest.nonce,
	},
});

export default client;
