<?php

namespace App\Enums;

/**
 * Catégorie du contenu du colis : simple métadonnée, ne détermine pas le prix.
 */
enum ContentCategory: string
{
    case Document    = 'document';
    case Clothing    = 'clothing';
    case Electronics = 'electronics';
    case Food        = 'food';
    case Other       = 'other';
}
