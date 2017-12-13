<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
function smarty_modifiercompiler_jq($params, $compiler) {
	$min = "''";
	if (isset($params[1])) {
		$min = $params[1];
	}

	return "wulaphp\\app\\App::assets('wula/jqadmin/'.{$params[0]},$min)";
}