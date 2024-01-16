<?php

/**
 * Settings
 *
 * A class that represents blockchain settings.
 *
 * @package BakWP\core
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakWP\core;

defined('ABSPATH') || exit();

class Settings
{
	public static $version = 'v1';

	public static $base = 'bak';

	public static function register_scripts($page)
	{

		$script_path = '/build/index.js';
		$script_asset_path =
			dirname(WPBAK_PLUGIN_FILE) . '/build/index.asset.php';
		$script_asset = file_exists($script_asset_path)
			? require $script_asset_path
			: ['dependencies' => ['wp-blocks', 'wp-editor'], 'version' => filemtime($script_path)];
		$script_url = plugins_url($script_path, WPBAK_PLUGIN_FILE);

		wp_register_script(
			'bak-wp-plugin',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		wp_localize_script('bak-wp-plugin', 'wpApiSettings', [
			'rest' => [
				'root' => rest_get_url_prefix() . '/bak/v1/',
				'nonce' => wp_create_nonce('wp_rest'),
			],
		]);

		wp_register_style(
			'bak-wp-plugin',
			plugins_url('/build/index.css', WPBAK_PLUGIN_FILE),
			// Add any dependencies styles may have, such as wp-components.
			[],
			filemtime(dirname(WPBAK_PLUGIN_FILE) . '/build/index.css')
		);

		// Register sidebar
		register_block_type(
			'bakwp/post',
			array(
				'title' => 'Blockchain',
				'script_handles' => ['bak-wp-plugin'],
				'style_handles'  => ['bak-wp-plugin'],
				'attributes'    => array(
					// Define your block attributes
				),
				'supports'      => array(
					// Add support for the sidebar
					'align' => true,
				),
			)
		);

		if ($page == 'post.php') {
			// Enqueue WordPress media scripts
			wp_enqueue_media();
		}
	}

	public static function add_bak_options_page()
	{
		add_options_page(
			'Bakrypt Authentication',
			'Bakrypt',
			'manage_options',
			'bakrypt-settings',
			array('BakWP\core\Settings', 'render_bakrypt_settings_page')
		);
	}
	// Render the options page content
	public static function render_bakrypt_settings_page()
	{
?>
		<div class="wrap">
			<h2>Blockchain Settings</h2>
			<form method="post" action="options.php">
				<?php
				settings_fields('bakrypt_settings_group');
				do_settings_sections('bakrypt-settings');
				submit_button('Save Settings');
				?>
			</form>
		</div>
<?php
	}


	public static function register_bak_settings()
	{
		// Register a setting for token
		register_setting('bakrypt_settings_group', 'bakrypt_token');

		// Register a setting for testnet token
		register_setting('bakrypt_settings_group', 'bakrypt_testnet_token');

		// Register a setting for testnet activation
		register_setting('bakrypt_settings_group', 'bakrypt_testnet_active');

		// Add a section for Bakrypt Settings
		add_settings_section(
			'bakrypt_settings_section',
			'Bakrypt API configuration',
			array('BakWP\core\Settings', 'bakrypt_settings_section_callback'),
			'bakrypt-settings'
		);

		// Add fields for token and testnet token
		add_settings_field(
			'bakrypt_token',
			'Token*',
			array('BakWP\core\Settings', 'bakrypt_token_callback'),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);

		add_settings_field(
			'bakrypt_testnet_token',
			'Testnet Token (Optional)',
			array('BakWP\core\Settings', 'bakrypt_testnet_token_callback'),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);

		// Add field for testnet activation
		add_settings_field(
			'bakrypt_testnet_active',
			'Testnet is Active',
			array('BakWP\core\Settings', 'bakrypt_testnet_active_callback'),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);
	}

	// Callback functions for rendering fields
	public static function bakrypt_token_callback()
	{
		$token = get_option('bakrypt_token');
		echo '<input type="password" name="bakrypt_token" value="' . esc_attr($token) . '" />';
	}

	public static function bakrypt_testnet_token_callback()
	{
		$testnetToken = get_option('bakrypt_testnet_token');
		echo "<hr/>";
		echo '<input type="password" name="bakrypt_testnet_token" value="' . esc_attr($testnetToken) . '" />';
	}

	public static function bakrypt_testnet_active_callback()
	{
		$testnetActive = get_option('bakrypt_testnet_active');
		echo '<input type="checkbox" name="bakrypt_testnet_active" ' . checked(1, $testnetActive, false) . ' />';
	}

	public static function bakrypt_settings_section_callback()
	{
		echo '<p>Visit our website to view your account token.</p>';
		echo '<h4><a href="https://bakrypt.io/account" target="_blank">https://bakrypt.io/account</a><h4>';
		echo '<div class="media"><img src="https://gateway.bakrypt.io/ipfs/QmeAJcMyNU9HpLCH9NnNrEnNhPhWm87XgxhRH6xuEQqRnK/" /><br/><small>* Screenshot of a section from the user dashboard at https://bakrypt.io/account</small></div>';
		echo '<h3>Paste your authentication token below:</h3>';
	}
}
