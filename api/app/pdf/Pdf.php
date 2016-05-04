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
        $this->filename = dirname(__FILE__) . "/../../docs/fv{$this->doc->serial_number}z{$this->doc->print_date}.pdf";
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


    private function dec($float)
    {
        return number_format((float)$float, 2, ',', '');
    }

    private function html()
    {
        $return = "
        <style>
            h3, h4, th, * {color: #444}
            th, td {font-size: 0.9em, vertical-align: top; }
            thead tr th {border-bottom: 0.2pt solid #666}
            .summary {border-bottom: 0.2pt solid #ddd; border-top: 0.2pt solid #666;}
            .light {font-family:robotolight }
            .thin {font-family:robotothin }
            .tp2 {margin-top: 2em }
            .tp3 {margin-top: 3em }
            .gray {color: #666 }
        </style>
        <div class=\"light\">
        <h3 class=\"right-align\">Faktura nr {$this->doc->serial_number}{$this->doc->serial_number_suffix}</h3>
        <div>
            <p class=\"right-align\">";
            if ($this->doc->print_date === $this->doc->sell_date) {
                $return .= "
                    <span class=\"thin\">{$this->doc->print_date}</span>";

            } else {
                $return .= "
                    Data wystawienia: <span class=\"thin\">{$this->doc->print_date}</span>
                    Data dokonania: <span class=\"thin\">{$this->doc->sell_date}</span>";
            }

         $return .= "
            </p>
        </div>
        <div class=\"light tp2\">
            <div style=\"float: left; width: 55%\">
                <p>
                <span class=\"thin\">Sprzedawca</span><br>
                {$this->options[long_name][0]}<br>
                {$this->options[address][0]}<br>
                {$this->options[zip][0]} {$this->options[city][0]}<br>
                NIP: {$this->options[nip][0]}</p>
            </div>
            <div style=\"float: left: width: 30%;\">
                <p>
                <span class=\"thin\">Nabywca</span><br>
                {$this->doc->client->long_name}<br>
                {$this->doc->client->address}<br>
                {$this->doc->client->zip} {$this->doc->client->city}<br>
                NIP: {$this->doc->client->nip}</p>
            </div>
        </div>

        <div>
            <table class=\"thin tp3\">
                <thead>
                    <tr>
                        <th class=\"center-align\">Lp</th>
                        <th>Tytuł</th>
                        <th class=\"center-align\">Ilość</th>
                        <th class=\"right-align\">Cena</th>
                        <th class=\"center-align\">VAT</th>
                        <th class=\"right-align\">Netto</th>
                        <th class=\"right-align\">W. VAT</th>
                        <th class=\"right-align\">Brutto</th>
                    </tr>
                </thead>
                <tbody>
                ";

                $taxValues = array();
                $i = 0;
                foreach ($this->doc->items as $item) {
                    $i++;
                    $return .=
                   "<tr>
                        <td class=\"center-align\">$i</td>
                        <td>{$item->title}</td>
                        <td class=\"center-align\">{$item->pieces} szt.</td>
                        <td class=\"right-align\">" . $this->dec($item->price) ."</td>
                        <td class=\"center-align\">{$item->vat}%</td>
                        <td class=\"right-align\">" . $this->dec($item->netto) ."</td>
                        <td class=\"right-align\">" . $this->dec($item->vat_value) ."</td>
                        <td class=\"right-align\">" . $this->dec($item->brutto) ."</td>
                    </tr>";

                    $taxValues[$item->vat] += $item->netto;
                }

                $payment = ucfirst($this->doc->payment);

                $return .=
                    "<tr>
                        <td colspan=\"4\"></td>
                        <td class=\"right-align summary gray \">Razem:</td>
                        <td class=\"right-align summary\">" . $this->dec($this->doc->netto) ."</td>
                        <td class=\"right-align summary\">" . $this->dec($this->doc->vat) ."</td>
                        <td class=\"right-align summary\">" . $this->dec($this->doc->brutto) ."</td>
                    </tr>";

                foreach ($taxValues as $vat => $netto) {
                    $vatV = round($netto * $vat / 100, 2);
                    $brutto = $netto + $vatV;

                    $return .=
                    "<tr>
                        <td colspan=\"4\"></td>
                        <td class=\"right-align gray\">VAT {$vat}%:</td>
                        <td class=\"right-align\">" . $this->dec($netto) ."</td>
                        <td class=\"right-align\">" . $this->dec($vatV) ."</td>
                        <td class=\"right-align\">" . $this->dec($brutto) ."</td>
                    </tr>";
                }

                $return .=
                "</tbody>
            </table>
        </div>
        <div class=\"tp2\">
            <h4>
                Do zapłaty: <strong>" . $this->dec($this->doc->brutto) ." zł</strong>
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
