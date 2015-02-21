<?php

class Pdf
{
    private $doc, $filename, $pdf, $options;

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
        $this->options = \Options::all();
        
        $this->pdf = new \FPDI();

        $this->pdf->SetAutoPageBreak(true, 0);
        $this->pdf->SetPrintHeader(false);
        $this->pdf->setFontSubsetting(true);
        //$this->pdf->setSourceFile(dirname(__FILE__) . '/../view/template.pdf');
        //$tpl = $this->pdf->importPage(1);
        
        $this->pdf->addPage();
        //$this->pdf->useTemplate($tpl);
        //$fontname = $pdf->addTTFfont('Roboto-Light.ttf', 'TrueTypeUnicode', '', 32);
        
        $this->pdf->SetFont('freesans');
        $this->pdf->SetTextColor(0,0,0);

        $this->pdf->writeHTML($this->html(), true, false, true, false, '');

        return $this->pdf->Output($this->filename, 'F');
    }

    public function get()
    {
        return array('filename' => $this->filename, 'content' => file_get_contents($this->filename));
    }


    private function html()
    {
        $return = "
        <p></p><p></p>
        <h3>Faktura VAT nr {$this->doc->serial_number}{$this->doc->serial_number_suffix}</h3>
        <table>
            <tr>
                <td>
                    <p>Data sprzedaży<br>
                    {$this->doc->sell_date}</p>
                </td>
                <td>
                    <p>Data wystawienia<br>
                    {$this->doc->print_date}</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Nabywca</p>
                    <p>
                    {$this->doc->client->long_name}<br>
                    {$this->doc->client->address}<br>
                    {$this->doc->client->zip} {$this->doc->client->city}<br>
                    {$this->doc->client->nip}</p>
                </td>
                <td>
                    <p>Sprzedawca</p>
                    <p>
                    bibi studio Barbara Feleniak<br>
                    Wyszyńskiego 82/6<br>
                    66-400 Gorzów Wlkp.<br>
                    1234567890</p>
                </td>
            </tr>
        </table>
        <p></p><p></p>
        <div>
            <table style=\"padding: 10pt 0 \">
                <thead>
                    <tr>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Lp</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Tytuł</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Cena</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Ilość</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">VAT</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Netto</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">W. VAT</th>
                        <th style=\"border-bottom: 0.25pt solid #cccccc; color: #333; font-weight: bold;\">Brutto</th>
                    </tr>
                </thead>
                <tbody>
                ";
                $i = 0;
                foreach ($this->doc->items as $item) {
                    $i++;
                    $return .= 
                   "<tr>
                        <td>$i</td>
                        <td>{$item->title}</td>
                        <td>{$item->price}</td>
                        <td>{$item->pieces}</td>
                        <td>{$item->vat}</td>
                        <td>{$item->netto}</td>
                        <td>{$item->vat_value}</td>
                        <td>{$item->brutto}</td>
                    </tr>";
                }
                
                $payment = ucfirst($this->doc->payment);
                
                $return .=
                    "<tr>
                        <td colspan=\"5\"></td>
                        <td style=\"border-top: 0.25pt solid #dddddd;\"><p>{$this->doc->netto}</p></td>
                        <td style=\"border-top: 0.25pt solid #dddddd;\">{$this->doc->vat}</td>
                        <td style=\"border-top: 0.25pt solid #dddddd; margin-top: 12pt; padding-top: 12pt\">{$this->doc->brutto}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <h4>
                Do zapłaty: <strong>{$this->doc->brutto}</strong>
            </h4>
            <p>
                Słownie: {$this->doc->in_word}
            </p>
            <p style=\"color: #333;\">
                {$payment}
            ";
            if ($this->doc->payment === 'przelew') {
                $offset = date('j.m.Y', strtotime("{$this->doc->print_date}  + {$this->doc->payment_offset} days"));
            $return .=
                "
                do {$offset} r. na konto bankowe nr 1234567890
                ";
            }
            $return .= 
            "
            </p>
        </div>
        ";

        return $return;
    }
}