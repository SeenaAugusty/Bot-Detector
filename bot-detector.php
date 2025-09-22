<?php
/*
Plugin Name: Bot Detector using Mouse movements and LSTM Model
Description: Classifies users as bot or human using ONNX model in-browser.
Version: 1.3
*/

function enqueue_bot_detector_scripts() {
    wp_enqueue_script(
        'onnx-runtime',
        'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js',
        array(),
        null,
        true
    );
    wp_enqueue_script(
        'bot-detector-js',
        plugin_dir_url(__FILE__) . 'js/tracker.js',
        array('onnx-runtime'),
        time(),
        true
    );
}
add_action('wp_enqueue_scripts', 'enqueue_bot_detector_scripts');
?>