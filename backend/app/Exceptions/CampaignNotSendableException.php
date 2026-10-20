<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * La campagne ne peut pas être (re)mise en file : déjà envoyée, en cours
 * d'envoi, ou aucun abonné. Le message est destiné à l'utilisateur (422).
 */
class CampaignNotSendableException extends RuntimeException {}
