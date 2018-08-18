<?php
header('Content-Type: application/json');
$response["id"] = 10;
$response["fileName"] = "Hello.pdf";
echo json_encode($response);