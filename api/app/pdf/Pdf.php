<?php

class Pdf
{
    private $doc, $filename, $options;

    function __construct($idOrDoc) 
    {
        if ($idOrDoc instanceof \Document) {
            $this->doc = $idOrDoc;
        } else {
            $this->doc = \Document::where('id', '=', $idOrDoc)->with(array('items', 'client'))->first();
        }
        $this->filename = dirname(__FILE__) . '/../../docs/fv' . $this->doc->serial_number . '.pdf';
    }

    public function generate()
    {
        $this->options = \Options::getArray();
        
        $pdf = new \mPDF();

        $pdf->SetImportUse(); 
        $pdf->SetHTMLHeader($header);
        $pagecount = $pdf->SetSourceFile(dirname(__FILE__) . '/../view/template.pdf');
        $tplIdx = $pdf->ImportPage($pagecount);
        $pdf->UseTemplate($tplIdx, 0, 5);

        $pdf->writeHTML(file_get_contents(dirname(__FILE__) . '/../../public/assets/css/fv-1.0.12.css'), 1);
        $pdf->writeHTML($this->html());
        $pdf->Output($this->filename, 'F');
        return;
    }

    public function get()
    {
        return array('filename' => $this->filename, 'content' => file_get_contents($this->filename));
    }


    private function html()
    {
        $return = "
        <style>
            h3, h4, th, * {color: #444}
            .light {font-family:robotolight }
            .thin {font-family:robotothin }
            .tp2 {margin-top: 2em }
            .tp3 {margin-top: 3em }
        </style>
        <div class=\"light\">
        <h3 class=\"right-align\">Faktura VAT nr {$this->doc->serial_number}{$this->doc->serial_number_suffix}</h3>
        <div>
            <p class=\"right-align\">
            Data sprzedaży: <span class=\"thin\">{$this->doc->sell_date}</span>
            &emsp;
            Data wystawienia: <span class=\"thin\">{$this->doc->print_date}</span>
            </p>
        </div>
        <table class=\"light tp2\">
            <tr>
                <td>
                    <p>Sprzedawca</p>
                    <p>
                    {$this->options[long_name][0]}<br>
                    {$this->options[address][0]}<br>
                    {$this->options[zip][0]} {$this->options[city][0]}<br>
                    {$this->options[nip][0]}</p>
                </td>
                <td>
                    <p>Nabywca</p>
                    <p>
                    {$this->doc->client->long_name}<br>
                    {$this->doc->client->address}<br>
                    {$this->doc->client->zip} {$this->doc->client->city}<br>
                    {$this->doc->client->nip}</p>
                </td>
            </tr>
        </table>
        
        <div>
            <table class=\"thin tp3\">
                <thead>
                    <tr>
                        <th class=\"center-align\">Lp</th>
                        <th>Tytuł</th>
                        <th class=\"right-align\">Cena</th>
                        <th class=\"center-align\">Ilość</th>
                        <th class=\"center-align\">VAT</th>
                        <th class=\"right-align\">Netto</th>
                        <th class=\"right-align\">W. VAT</th>
                        <th class=\"right-align\">Brutto</th>
                    </tr>
                </thead>
                <tbody>
                ";
                $i = 0;
                foreach ($this->doc->items as $item) {
                    $i++;
                    $return .= 
                   "<tr>
                        <td class=\"center-align\">$i</td>
                        <td>{$item->title}</td>
                        <td class=\"right-align\">{$item->price}</td>
                        <td class=\"center-align\">{$item->pieces}</td>
                        <td class=\"center-align\">{$item->vat}</td>
                        <td class=\"right-align\">{$item->netto}</td>
                        <td class=\"right-align\">{$item->vat_value}</td>
                        <td class=\"right-align\">{$item->brutto}</td>
                    </tr>";
                }
                
                $payment = ucfirst($this->doc->payment);
                
                $return .=
                    "<tr>
                        <td colspan=\"5\"></td>
                        <td class=\"right-align\">{$this->doc->netto}</td>
                        <td class=\"right-align\">{$this->doc->vat}</td>
                        <td class=\"right-align\">{$this->doc->brutto}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class=\"tp2\">
            <h4>
                Do zapłaty: <strong>{$this->doc->brutto} zł</strong>
            </h4>
            <p>
                Słownie: {$this->doc->in_word}
            </p>
            <p>
                {$payment}
            ";
            if ($this->doc->payment === 'przelew') {
                $offset = date('j.m.Y', strtotime("{$this->doc->print_date}  + {$this->doc->payment_offset} days"));
            $return .=
                "
                do {$offset} r. na konto bankowe nr {$this->options[bank_account][0]}
                ";
            }
            $return .= 
            "
            </p>
        </div>
        </div>
        ";

        return $return;
    }
}