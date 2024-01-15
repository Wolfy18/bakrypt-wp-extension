<?php

/**
 * Plugin Name: ImmuPress: Transforming Content Creation on WordPress
 * Plugin URI: https://bakrypt.io
 * Description: Mint your blog posts into the Cardano Blockchain
 * Version: 0.1.0
 * Author: Wolfgang Leon
 * Author URI: https://bakrypt.io/
 * Developer: Wolfgang Leon
 * Developer URI: https://bakrypt.io/pool/
 * Text Domain: bakrypt-wp-extension
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 * 
 *
 */

defined('ABSPATH') || exit;

define('WPBAK_ABSPATH', __DIR__ . '/');
define('WPBAK_PLUGIN_FILE', __FILE__);

# Autoload Classes with Composer
require_once "vendor/autoload.php";

// Initiate wc bakrypt class
use BakWP\core\BakWP;


# Add custom interval for every 3 minutes
add_filter('cron_schedules', 'bak_wp_add_every_three_minutes');
function bak_wp_add_every_three_minutes($schedules)
{
	$schedules['every_three_minutes'] = array(
		'interval'  => 180,
		'display'   => __('Every 3 Minutes', 'textdomain')
	);
	return $schedules;
}



function wpbakrypt_init()
{
	BakWP::init();
}

add_action('plugins_loaded', 'wpbakrypt_init', 11);

// ========= Cron Tasks ======= 
function bak_wp_cron_activate()
{
	// Schedule the cron task to run every 3 minutes
	wp_schedule_event(time(), 'every_three_minutes', 'bak_wp_cron_task');
}

function bak_wp_cron_deactivate()
{
	wp_clear_scheduled_hook('bak_wp_cron_task');
}

register_activation_hook(WPBAK_PLUGIN_FILE, 'bak_wp_cron_activate');
add_action('bak_wp_cron_task', array("BakExtension\core\Cron", "bak_run_cron_task"), 12);
register_deactivation_hook(WPBAK_PLUGIN_FILE, 'bak_wp_cron_deactivate');
