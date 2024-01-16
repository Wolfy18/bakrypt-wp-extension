const { withSelect, withDispatch } = wp.data;
const { PluginSidebar } = wp.editPost;
const { TextControl, CheckboxControl } = wp.components;

const BakSidebar = ({
	textValue,
	updateTextValue,
	checkboxValue,
	updateCheckboxValue,
}) => (
	<PluginSidebar
		name="bak-sidebar"
		title="Blockchain Tokenization"
		icon="database"
	>
		<TextControl
			label="Text Value"
			value={textValue}
			onChange={(newValue) => {
				updateTextValue(newValue);
				updateBackendSettings({ text_value: newValue });
			}}
		/>
		<CheckboxControl
			label="Checkbox Value"
			checked={checkboxValue}
			onChange={(newValue) => {
				updateCheckboxValue(newValue);
				updateBackendSettings({ checkbox_value: newValue });
			}}
		/>
	</PluginSidebar>
);

const BakSidebarWithState = withSelect((select) => {
	return {
		textValue:
			select('core/editor').getEditedPostAttribute('meta')
				.custom_text_value || '',
		checkboxValue:
			select('core/editor').getEditedPostAttribute('meta')
				.custom_checkbox_value || false,
		postId: select('core/editor').getCurrentPostId(),
	};
})(
	withDispatch((dispatch) => {
		return {
			updateTextValue: (textValue) => {
				dispatch('core/editor').editPost({
					meta: { custom_text_value: textValue },
				});
			},
			updateCheckboxValue: (checkboxValue) => {
				dispatch('core/editor').editPost({
					meta: { custom_checkbox_value: checkboxValue },
				});
			},
		};
	})(BakSidebar)
);

// Function to update backend settings via REST API
function updateBackendSettings(settings) {
	const postId = wp.data.select('core/editor').getCurrentPostId();
	console.log(settings, '<----- settings when updating data ');
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
