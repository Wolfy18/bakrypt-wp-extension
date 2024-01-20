import renderLaunchpadModal from './launchpadModal';
const { withSelect, withDispatch } = wp.data;
const { PluginSidebar } = wp.editPost;
const { TextControl, TextareaControl, Panel, PanelBody, PanelRow } =
	wp.components;

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
}) => (
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
					{!assetId
						? renderLaunchpadModal(
								{
									accessToken: 'xxx',
								},
								() => '[]',
								() => {
									console.log('this is submitter');
								}
						  )
						: 'minted'}
				</PanelRow>
			</PanelBody>
		</Panel>
	</PluginSidebar>
);

const BakSidebarWithState = withSelect((select) => {
	return {
		id:
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

// Function to update backend settings via REST API
function updateBackendSettings(settings) {
	const postId = wp.data.select('core/editor').getCurrentPostId();

	wp.apiFetch({
		path: `/custom-sidebar/v1/update-settings/`,
		method: 'POST',
		data: {
			post_id: postId,
			...settings,
		},
	})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

export { BakSidebarWithState, updateBackendSettings };
