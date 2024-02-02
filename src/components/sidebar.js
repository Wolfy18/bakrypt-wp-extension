import renderLaunchpadModal from './launchpadModal';
import renderTransactionModal from './transactionModal';
import Bakrypt from '../api/bakrypt';
import { useEffect, useState } from 'react';
const { withSelect, withDispatch } = wp.data;
const { PluginSidebar } = wp.editPost;
const {
	TextControl,
	TextareaControl,
	Panel,
	PanelBody,
	PanelRow,
	Button,
	Notice,
} = wp.components;

const BakSidebar = ({
	assetId,
	policyId,
	fingerprint,
	assetName,
	name,
	image,
	amount,
	metadata,
	transactionId,
	status,
}) => {
	const [bakrypt, setBakrypt] = useState(undefined);
	const [config, setConfig] = useState({
		testnet: undefined,
		accessToken: undefined,
	});
	const [alertState, setAlertState] = useState({
		type: undefined,
		message: '',
		show: false,
	});

	const viewTransaction = async () => {
		if (!bakrypt) return;
		return await bakrypt.getTransaction(transactionId);
	};

	// Function to update backend settings via REST API
	const updatePost = (data) => {
		const postId = wp.data.select('core/editor').getCurrentPostId();

		wp.apiFetch({
			path: `/bak/v1/posts/${postId}`,
			method: 'PUT',
			data,
		})
			.then(() => {
				setAlertState({
					show: true,
					type: 'success',
					message: 'Post has been updated',
				});
			})
			.catch(() => {
				setAlertState({
					show: true,
					type: 'error',
					message: 'Unable to update post',
				});
			});
	};
	const deleteAsset = async () => {
		const postId = wp.data.select('core/editor').getCurrentPostId();
		await wp.apiFetch({
			path: `/bak/v1/posts/${postId}`,
			method: 'DELETE',
		});
		setAlertState({
			show: true,
			type: 'info',
			message: 'Blockchain information has been dropped',
		});
	};
	const updateAsset = async () => {
		if (!bakrypt) return;
		const asset = await bakrypt.getAsset(assetId);
		if (asset) {
			updatePost({
				bk_token_uuid: asset.uuid,
				bk_token_policy: asset.policy_id,
				bk_token_fingerprint: asset.fingerprint,
				bk_token_asset_name: asset.asset_name,
				bk_token_image: asset.image,
				bk_token_name: asset.name,
				bk_token_amount: asset.amount,
				bk_token_status: asset.status,
			});
		}
	};

	useEffect(() => {
		(async () => {
			const response = await wp.apiFetch({
				path: `/bak/v1/auth/token`,
				method: 'POST',
			});
			setBakrypt(
				new Bakrypt(
					!!response.testnet
						? 'https://testnet.bakrypt.io'
						: 'https://bakrypt.io',
					response.data.access_token
				)
			);
			setConfig({
				testnet: response.testnet,
				accessToken: response.data.access_token,
			});
		})();
	}, []);

	return (
		<PluginSidebar
			name="bak-sidebar"
			title="Blockchain Tokenization"
			icon="database"
		>
			<Panel>
				<PanelBody title="Asset information" initialOpen={true}>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Policy Id"
							disabled
							value={policyId}
						/>{' '}
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Fingerprint"
							disabled
							value={fingerprint}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Asset Name"
							disabled
							value={assetName}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Name"
							disabled
							value={name}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Image"
							disabled
							value={image}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Number of Tokens"
							disabled
							value={amount}
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl
							label="Token Metadata"
							disabled
							value={metadata}
						/>
					</PanelRow>
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody title="Bakrypt Request">
					<PanelRow>
						<TextControl
							className="w-full"
							label="BAK ID"
							disabled
							value={assetId}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="BAK Transaction ID"
							disabled
							value={transactionId}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="w-full"
							label="Status"
							disabled
							value={status}
						/>
					</PanelRow>
					<PanelRow>
						{!transactionId
							? renderLaunchpadModal(
									{
										accessToken: config.accessToken,
										testnet: config.testnet,
									},
									() => undefined,

									(detail) => {
										const { collection, transaction } =
											detail;

										const asset = collection[0];

										updatePost({
											bk_token_uuid: asset.uuid,
											bk_token_policy:
												transaction.policy_id,
											bk_token_fingerprint:
												asset.fingerprint,
											bk_token_asset_name:
												asset.asset_name,
											bk_token_image: asset.image,
											bk_token_name: asset.name,
											bk_token_amount: asset.amount,
											bk_token_status: transaction.status,
											bk_token_json: JSON.stringify(
												transaction.metadata
											),
											bk_token_transaction:
												transaction.uuid,
										});
									}
							  )
							: renderTransactionModal(
									{
										accessToken: config.accessToken,
										testnet: config.testnet,
									},
									viewTransaction,

									[]
							  )}
						{transactionId && (
							<Button variant="secondary" onClick={updateAsset}>
								Sync Token
							</Button>
						)}
					</PanelRow>
					<PanelRow>
						<Button
							variant="secondary"
							isDestructive={true}
							onClick={deleteAsset}
						>
							Clear
						</Button>
					</PanelRow>
					<PanelRow>
						{alertState.show && (
							<Notice status={alertState.type}>
								{alertState.message}
							</Notice>
						)}
					</PanelRow>
				</PanelBody>
			</Panel>
		</PluginSidebar>
	);
};

const BakSidebarWithState = withSelect((select) => {
	return {
		assetId:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_uuid || '',
		policyId:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_policy || '',
		fingerprint:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_fingerprint || '',
		assetName:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_asset_name || '',
		name:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_name || '',
		image:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_image || '',
		amount:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_amount || '',
		metadata:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_json || '',
		transactionId:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_transaction || '',
		status:
			select('core/editor').getEditedPostAttribute('meta')
				.bk_token_status || '',
	};
})(
	withDispatch(() => {
		return {};
	})(BakSidebar)
);

export { BakSidebarWithState };
