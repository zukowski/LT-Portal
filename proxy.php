<?php

$url = $_GET['url'];
$path = $_GET['path'];
$format = $_GET['format'];

$return = file_get_contents($url.$path.'.'.$format);
echo $return;