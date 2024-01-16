import axios from 'axios';
const client = axios.create({
	baseURL: `${wpApiSettings.rest.root}`,
	responseType: 'json',
	responseEncoding: 'utf8',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		'X-WP-Nonce': wpApiSettings.rest.nonce,
	},
});

export default client;
