<?php

namespace App\Services;

use App\Models\BusinessDocument;
use App\Models\DocumentItem;

class ContractTerms
{
    public const CATEGORIES = ['website' => 'Website development', 'seo' => 'SEO', 'marketing' => 'Digital marketing', 'photography' => 'Photography / video', 'design' => 'Graphic design', 'general' => 'Other / custom service'];

    public function category(DocumentItem $item): string
    {
        $explicit = $item->service?->contract_category;
        if (array_key_exists($explicit ?? '', self::CATEGORIES)) {
            return $explicit;
        }
        $text = mb_strtolower(($item->service?->source_key ?? '').' '.$item->description);
        foreach (['website' => ['website', 'wordpress', 'site web', 'développement web', 'web development'], 'seo' => ['seo', 'référencement'], 'photography' => ['photograph', 'photo', 'video', 'vidéo'], 'marketing' => ['marketing', 'social media', 'publicité', 'ads'], 'design' => ['graphic', 'graphique', 'logo', 'design']] as $category => $words) {
            foreach ($words as $word) {
                if (str_contains($text, $word)) {
                    return $category;
                }
            }
        }

        return 'general';
    }

    public function compose(BusinessDocument $quote, ?string $base = null): string
    {
        $fr = $quote->language === 'fr';
        $parts = [$fr ? 'OBJET ET PÉRIMÈTRE\nLe présent contrat porte uniquement sur les prestations, livrables, quantités et prix du devis accepté N°'.$quote->number.'. Toute prestation supplémentaire nécessite un accord écrit et un devis révisé.' : 'SCOPE\nThis agreement covers only the services, deliverables, quantities and prices in accepted quote No. '.$quote->number.'. Additional work requires written agreement and a revised quote.'];
        foreach ($quote->items as $item) {
            $parts[] = ($fr ? 'PRESTATION : ' : 'SERVICE: ').$item->description."\n".($item->scope ?: ($fr ? 'Périmètre : conformément à la ligne du devis accepté.' : 'Scope: as specified in the accepted quote line.'));
        }
        $clauses = $fr ? [
            'website' => "SITE WEB\nLes pages, fonctionnalités et intégrations sont limitées au devis. Le client fournit les contenus, accès et validations nécessaires. Domaine, hébergement, licences et maintenance sont inclus uniquement lorsqu’ils figurent au devis. Les demandes hors périmètre sont chiffrées séparément.",
            'seo' => "RÉFÉRENCEMENT\nLes optimisations, contenus et rapports sont ceux du devis. Le client fournit les accès nécessaires. Les résultats dépendent notamment des moteurs de recherche et de la concurrence ; aucune position ni volume de trafic n’est garanti.",
            'marketing' => "MARKETING DIGITAL\nLes canaux, campagnes, contenus et rapports sont limités au devis. Le client valide les contenus et fournit les accès. Le budget publicitaire et les frais des plateformes sont distincts des honoraires sauf inclusion explicite au devis. Aucun résultat commercial chiffré n’est garanti.",
            'photography' => "PHOTOGRAPHIE / VIDÉO\nLes séances, lieux, nombre de fichiers, formats et retouches sont ceux du devis. Le client organise les accès et autorisations nécessaires. Les fichiers sources et droits d’usage spécifiques sont inclus uniquement si prévus au devis ; les usages autorisés doivent être précisés avant signature.",
            'design' => "DESIGN GRAPHIQUE\nLes supports, formats, propositions et révisions sont ceux du devis. Le client fournit les textes et éléments de marque et garantit disposer des droits nécessaires. Les fichiers sources et droits d’usage spécifiques sont ceux convenus au devis ; les usages autorisés doivent être précisés avant signature.",
            'general' => "PRESTATIONS COMPLÉMENTAIRES\nLes livrables, exclusions et limites sont ceux du devis accepté. Les modalités propres à cette prestation sont à compléter dans ce contrat avant signature.",
        ] : [
            'website' => "WEBSITE DEVELOPMENT\nPages, features and integrations are limited to the quote. The client supplies content, access and approvals. Domains, hosting, licences and maintenance are included only when listed in the quote. Out-of-scope requests are priced separately.",
            'seo' => "SEO\nOptimisations, content and reporting are those in the quote. The client supplies required access. Results depend on search engines and competition; no ranking or traffic volume is guaranteed.",
            'marketing' => "DIGITAL MARKETING\nChannels, campaigns, content and reporting are limited to the quote. The client approves content and supplies access. Advertising spend and platform charges are separate from service fees unless explicitly included. No specific sales result is guaranteed.",
            'photography' => "PHOTOGRAPHY / VIDEO\nSessions, locations, file counts, formats and editing are those in the quote. The client arranges access and necessary permissions. Source files and specific usage rights are included only where quoted; authorised uses must be specified before signing.",
            'design' => "GRAPHIC DESIGN\nOutputs, formats, concepts and revisions are those in the quote. The client supplies text and brand assets and confirms the necessary rights. Source files and usage rights are as agreed in the quote; authorised uses must be specified before signing.",
            'general' => "CUSTOM SERVICES\nDeliverables, exclusions and limits are those in the accepted quote. Complete the service-specific arrangements in this agreement before signing.",
        ];
        foreach ($quote->items->map(fn ($i) => $this->category($i))->unique() as $category) {
            $parts[] = $clauses[$category];
        }
        $parts[] = $fr ? "ORGANISATION ET VALIDATIONS\nLe calendrier et les modalités de paiement figurent ci-dessous. Les délais dépendent de la réception des contenus, accès et validations du client. Toute modification du calendrier est convenue par écrit. Les révisions incluses sont celles du devis ; les demandes supplémentaires font l’objet d’un accord séparé.\n\nCONFIDENTIALITÉ\nLes informations et accès transmis pour les prestations sont utilisés uniquement pour leur réalisation et restent confidentiels.\n\nFIN OU MODIFICATION DE LA MISSION\nToute modification ou interruption est notifiée par écrit. Les parties conviennent du travail réalisé, des montants dus et de la remise des livrables selon le devis et les paiements enregistrés." : "SCHEDULE AND APPROVALS\nSchedule and payment arrangements appear below. Delivery depends on receiving the client’s content, access and approvals. Schedule changes are agreed in writing. Included revisions are those in the quote; additional requests require separate agreement.\n\nCONFIDENTIALITY\nInformation and access supplied for the services are used only to perform them and remain confidential.\n\nCHANGES OR ENDING THE ENGAGEMENT\nChanges or interruption are notified in writing. The parties agree on completed work, amounts due and deliverable handover according to the quote and recorded payments.";
        if (trim($quote->terms ?? '')) {
            $parts[] = ($fr ? 'CONDITIONS DU DEVIS' : 'QUOTE TERMS')."\n".$quote->terms;
        }
        if (trim($base ?? '')) {
            $parts[] = ($fr ? 'CONDITIONS COMPLÉMENTAIRES' : 'ADDITIONAL TERMS')."\n".$base;
        }

        return str_replace('\\n', "\n", implode("\n\n", $parts));
    }
}
