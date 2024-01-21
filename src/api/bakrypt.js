import {
	retrieveAsset,
	retrieveTransaction,
	uploadAttachment,
} from './helpers';

class Bakrypt {
	constructor(uri, token) {
		this.token = token;
		this.uri = uri;
	}

	getTransaction(id) {
		return retrieveTransaction({
			id,
			uri: this.uri,
			token: this.token,
		});
	}

	getAsset(id) {
		return retrieveAsset({
			id,
			uri: this.uri,
			token: this.token,
		});
	}

	postAttachment(file) {
		return uploadAttachment({
			file,
			uri: this.uri,
			token: this.token,
		});
	}
}

export default Bakrypt;
