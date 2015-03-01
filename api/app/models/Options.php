<?php

class Options extends FVModel
{
    protected $table = 'options';

    public static function getArray()
    {
        $options = array();

        foreach(self::all() as $el) {
            if (!isset($el['key'])) {
                $options[$el['key']] = array();
            }
            $options[$el['key']][] = $el['value'];
        };
        return $options;
    }
}