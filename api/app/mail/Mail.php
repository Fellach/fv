<?php

class Mail 
{
    static function send($file, $doc)
    {
        global $config;
        
        $transport = \Swift_SmtpTransport::newInstance($config['mail']['host'], 25)
        ->setUsername($config['mail']['user'])
        ->setPassword($config['mail']['pass']);
        $mailer = \Swift_Mailer::newInstance($transport);

        $message = \Swift_Message::newInstance()
        ->setSubject('Faktura VAT')
        ->setFrom(array($config['mail']['from'] => 'Basia Feleniak'))
        ->setBody('Faktura w załączniku. Pozdrawiam')
        ->attach(\Swift_Attachment::fromPath($file['filename']));

        if (!empty($doc->client->email)) {
            $message->setTo(array($doc->client->email => $doc->client->long_name));
        }
        $message->setBcc(array("basia@feleniak.pl" => "Ja, Basia"));

        return $mailer->send($message);
    }
}