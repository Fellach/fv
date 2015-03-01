<?php

class Document extends FVModel
{
	protected $table = 'document';
    protected $guarded = array('updated_at', 'created_at');

	public function items()
	{
		return $this->hasMany('Item');
	}

	public function client()
    {
        return $this->belongsTo('Client');
    }

    public function createWith($data) 
    {
        foreach($data as $property => $value) {
            if (!is_array($value)) {
                $this->{$property} = $value;
            }
        }
        $this->save();

        if (!empty($data['items'])) {

            $items = array();
            foreach($data['items'] as $values) {
                $items[] = new \Item($values);
            }
            $this->items()->saveMany($items);
        }
    }

    public function updateWith($data) 
    {
        foreach($data as $property => $value) {
            if (!is_array($value) && $this->{$property} !== $value) {
                $this->{$property} = $value;
            }
        }
        if (!empty($data['items'])) {

            $items = array();
            foreach($data['items'] as $values) {
                if (!empty($values['id'])) {
                    $this->items()->find($values['id'])->update($values);
                } else {
                    $this->items()->save(new \Item($values));
                }
            }
        }
        $this->push();
    }

    public function setVatAttribute($value) 
    {
        $this->attributes['vat'] = (float)str_replace(',', '.', $value);
    }

    public function setNettoAttribute($value) 
    {
        $this->attributes['netto'] = (float)str_replace(',', '.', $value);
    }

    public function setBruttoAttribute($value) 
    {
        $this->attributes['brutto'] = (float)str_replace(',', '.', $value);
    }
}