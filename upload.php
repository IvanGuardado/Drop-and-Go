<?php
sleep(1);
$a = new stdClass();
$a->status = true;
$a->message = "OK";
echo json_encode($a);

