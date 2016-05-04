<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_cache_limiter(false);
session_start();

require '../vendor/autoload.php';
require '../app/passwords.php';
require '../app/db.php';

$app = new \Slim\Slim(array(
	'templates.path' => '../app/view',
));

\Slim\Route::setDefaultConditions(array(
	'id' => '\d+'
));

$app->get('/', function () use ($app) {
	$app->response->headers->set('Content-Type', 'text/html');

	if (empty($_SESSION['user'])){
		$app->render('login.html');
	} else {
		$app->render('index.html');
	}
});

$app->get('/login', function () use ($app) {
    $app->response->headers->set('Content-Type', 'text/html');
    $app->render('login.html');
});

$app->get('/logout', function () use ($app) {
    $app->deleteCookie('PHPSESSID');
    $_SESSION = array();
    session_destroy();

    $app->response->redirect('/');
});

$app->post('/login', function () use ($app) {
  $user = new \User();

  if ($logged = $user->login($app->request->post('username'), $app->request->post('password'))) {
    	$_SESSION['user'] = $logged->id;
      $app->response->redirect('/');
  } else {
      $app->render('login.html');
  }
});

$app->group('/api', function () use ($app) {
	if (empty($_SESSION['user'])){
		$app->halt(403);
	}
},function () use ($app) {

	//$app->response->headers->set('Content-Type', 'application/json');

	/**
	 * FV
	 *
	 */
	$app->group('/document', function () use ($app) {

		//get all
		$app->get('/', function () use ($app) {

			$year = $app->request->params('year');

			if (!$year) {
				$year = date_format(date_create(), 'Y');
			}

			$docs = \Document::whereYear('print_date', '=', $year)->with(array('items', 'client'))->get();
			echo $docs->toJson();
		});

		//get one
		$app->get('/:id', function ($id) {

			$doc = \Document::where('id', '=', $id)->with(array('items', 'client'))->first();
			echo $doc->toJson();
		});

		//save
		$app->post('/', function () use ($app) {

			$doc = new \Document();
			$doc->createWith(json_decode($app->request->getBody(), true));

	    	$pdf = new \Pdf($doc);
			$pdf->generate();

			echo $doc->toJson();
		});

		//update
		$app->put('/:id', function ($id) use ($app) {

			$doc = \Document::where('id', '=', $id)->first();
			$doc->updateWith(json_decode($app->request->getBody(), true));

			$pdf = new \Pdf($doc);
			$pdf->generate();

			echo $doc->toJson();
		});

		//delete
		$app->delete('/:id', function ($id) {

			$doc = \Document::where('id', '=', $id);
			$doc->delete();
			echo json_encode(array('status' => 200));
		});

		//delete an item
		$app->delete('/:id/items/:id_item', function ($id, $id_item) {

			$doc = \Document::find($id);
			$doc->items()->find($id_item)->delete();
			echo json_encode(array('status' => 200));
		});

		// pdf
		$app->group('/pdf', function () use ($app) {

			//send an email
			$app->get('/send/:id', function ($id) {

				$doc = \Document::where('id', '=', $id)->with(array('items', 'client'))->first();

				if ($doc && $doc->client->email) {

					$pdf = new \Pdf($doc);
					$file = $pdf->get();

					\Mail::send($file, $doc);
					echo $doc->toJson();
				}
			});

			//get
			$app->get('/:id', function ($id) use ($app) {
				$pdf = new \Pdf($id);
				$file = $pdf->get();

				$app->response->headers->set('Content-Type', "application/octet-stream");
				$app->response->headers->set('Pragma', "public");
				$app->response->headers->set('Expires', "0");
				$app->response->headers->set('Cache-Control', "must-revalidate");
				$app->response->headers->set('Content-Disposition', 'attachment; filename=' . basename($file['filename']));
				$app->response->headers->set('Content-Transfer-Encoding', 'binary');
				$app->response->headers->set('Content-Length', strlen($file['content']));
				$app->response->setBody($file['content']);
			});
		});
	});


	/**
	 * Clients
	 *
	 */
	$app->group('/client', function () use ($app) {

		//get all
		$app->get('/', function () {

			$clients = \Client::where('is_deleted', '=', false)->get();
			echo $clients->toJson();
		});

		//get one
		$app->get('/:id', function ($id) {

			$client = \Client::find($id);
			echo $client->toJson();
		});

		//save new
		$app->post('/', function () use ($app) {

			$client = \Client::create(json_decode($app->request->getBody(), true));

			\Options::where('key', '=', 'thumbnail')->where('value', '=', $client->thumbnail)->delete();

			echo $client->toJson();
		});

		//update
		$app->post('/:id', function ($id) use ($app) {
			$request = json_decode($app->request->getBody(), true);
			deleteClient($request['id']);
			unset($request['id']);

			$client = \Client::create($request);
			echo $client->toJson();
		});

		//delete
		$app->delete('/:id', function ($id) {

			deleteClient($id);
			echo json_encode(array('status' => 200));
		});
	});


	/**
	 * Options
	 *
	 */
	$app->group('/options', function () use ($app) {

		//get all
		$app->get('/', function () {

			$ops = \Options::all();
			echo $ops->toJson();
		});
	});
	$app->get('/user/create/:user/:pass', function ($name, $pass) {

		$user = new \User();
		$user->name = $name;
		$user->password = $pass;
		$user->save();
		echo "ok";
	});
});


$app->run();


function deleteClient($id) {
	$client = \Client::find($id);
	try {
		$client->delete();
	} catch (\Illuminate\Database\QueryException $qe) {
		$client->is_deleted = true;
		$client->save();
	}
}
