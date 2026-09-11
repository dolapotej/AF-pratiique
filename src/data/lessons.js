import { alignTextbook } from './textbook.js'
import { improveCards } from './cards.js'
import { deepen, sequence } from './depth.js'
import { coreLessons } from './core.js'

// Original introductory activities based on the topic list in the handoff.
// Keep IDs stable: saved progress uses them, independently of display order.
function topic(id, title, category, vocabulary, grammar, questions, writing, speaking) {
  return {
    id, title, category, subtitle: grammar[0], color: 'blue',
    cards: vocabulary.map(([front, back, example]) => ({ front, back, example, tag: title })),
    grammar: { title: grammar[0], explanation: grammar[1], examples: grammar[2], note: grammar[3] },
    quiz: questions.map(([question, options, answer]) => ({ question, options, answer })),
    writing: { prompt: writing[0], model: writing[1], rubric: writing[2] },
    speaking,
  }
}

const additionalLessons = [
  topic('alphabet', 'Alphabet et accents', 'Premiers échanges', [
    ['Épeler', 'To spell', 'Pouvez-vous épeler votre nom ?'],
    ['Un accent aigu', 'An acute accent', 'École commence par é.'],
    ['Un accent grave', 'A grave accent', 'Très contient è.'],
    ['Une cédille', 'A cedilla', 'Français contient ç.'],
  ], ['Lire et épeler', 'Le français utilise 26 lettres. Les accents modifient certaines lettres. Dans « salut », le t final ne se prononce pas ; dans « café », le é se prononce.', ['Lina : L – I – N – A.', 'É : e accent aigu.', 'Ç : c cédille.'], 'La prononciation présentée ici est un repère écrit : entraîne-toi à voix haute avec ton professeur.'], [
    ['Quel mot contient un accent aigu ?', ['Café', 'Classe', 'Salut'], 'Café'],
    ['Comment épelle-t-on Lina ?', ['L – I – N – A', 'L – A – N – I', 'I – L – N – A'], 'L – I – N – A'],
    ['Dans « salut », quelle lettre finale est muette ?', ['s', 'u', 't'], 't'],
  ], ['Écris ton prénom, épelle-le, puis donne un mot avec un accent.', 'Je m’appelle Léa. L – É – A. Café contient un accent aigu.', ['J’ai écrit mon prénom.', 'J’ai donné ses lettres dans l’ordre.', 'J’ai donné un mot accentué.']], 'Présente ton prénom et épelle-le lentement. Demande ensuite à un partenaire d’épeler son nom.'),

  topic('countries', 'Pays et nationalités', 'Identité', [
    ['Le Nigeria', 'Nigeria', 'Je suis du Nigeria.'], ['La France', 'France', 'Elle habite en France.'],
    ['Nigérian / nigériane', 'Nigerian', 'Ada est nigériane.'], ['Français / française', 'French', 'Léa est française.'],
  ], ['Accorder la nationalité', 'L’adjectif de nationalité s’accorde avec la personne. Il prend une minuscule en français.', ['Il est nigérian.', 'Elle est nigériane.', 'Elles sont françaises.'], 'Les formes peuvent changer : français devient française, mais belge reste belge.'], [
    ['Ada est une femme : elle est…', ['nigériane', 'nigérian', 'Nigeria'], 'nigériane'],
    ['Complète : Elles sont…', ['française', 'françaises', 'France'], 'françaises'],
    ['Quelle phrase est correcte ?', ['Il est France.', 'Il est française.', 'Il est français.'], 'Il est français.'],
  ], ['Présente deux personnes : donne leur prénom, leur pays et leur nationalité.', 'Ada est du Nigeria. Elle est nigériane. Paul est de France. Il est français.', ['J’ai présenté deux personnes.', 'J’ai nommé leurs pays.', 'J’ai accordé les nationalités.']], 'Dis de quel pays tu viens et ta nationalité. Pose les mêmes questions à un partenaire.'),

  topic('professions', 'Professions et études', 'Identité', [
    ['Un médecin', 'A doctor', 'Il est médecin.'], ['Une étudiante', 'A female student', 'Elle est étudiante.'],
    ['Un professeur', 'A teacher', 'Il est professeur.'], ['Travailler', 'To work', 'Je travaille à Lagos.'],
  ], ['Être + profession', 'Pour donner une profession simplement, utilise être sans article devant la profession.', ['Je suis médecin.', 'Elle est étudiante.', 'Nous sommes professeurs.'], 'Compare : « Je suis professeur » et « C’est un professeur ».'], [
    ['Complète : Je ___ médecin.', ['suis', 'es', 'est'], 'suis'],
    ['Quelle phrase donne une profession ?', ['Je suis lundi.', 'Je suis professeur.', 'Je suis ici.'], 'Je suis professeur.'],
    ['Complète : Elle est…', ['étudiant', 'étudiante', 'études'], 'étudiante'],
  ], ['Présente ta profession ou tes études et celles d’une autre personne.', 'Je suis étudiante. Mon ami est médecin. Il travaille à Lagos.', ['J’ai parlé de mes études ou de mon travail.', 'J’ai présenté une autre personne.', 'J’ai utilisé être sans article devant la profession.']], 'Demande « Quelle est ta profession ? » puis présente ton travail ou tes études en deux phrases.'),

  topic('pronouns', 'Pronoms et être', 'Grammaire', [
    ['Nous sommes', 'We are', 'Nous sommes en classe.'], ['Vous êtes', 'You are', 'Vous êtes professeur.'],
    ['Ils sont', 'They are (masculine or mixed)', 'Ils sont étudiants.'], ['Elles sont', 'They are (feminine)', 'Elles sont amies.'],
  ], ['Conjuguer être', 'Le pronom sujet indique de qui on parle : je, tu, il, elle, on, nous, vous, ils, elles.', ['Je suis ; tu es ; il / elle / on est.', 'Nous sommes ; vous êtes.', 'Ils / elles sont.'], 'Vous sert aussi à parler poliment à une seule personne.'], [
    ['Complète : Vous ___ en classe.', ['sommes', 'êtes', 'sont'], 'êtes'],
    ['Complète : On ___ ici.', ['est', 'es', 'suis'], 'est'],
    ['Remplace « Léa et Nina » : ___ sont étudiantes.', ['Elle', 'Nous', 'Elles'], 'Elles'],
  ], ['Écris quatre phrases avec être : utilise je, tu, nous et elles.', 'Je suis en classe. Tu es ici. Nous sommes étudiants. Elles sont françaises.', ['J’ai utilisé les quatre pronoms demandés.', 'J’ai choisi la bonne forme de être.', 'J’ai écrit des phrases complètes.']], 'Présente-toi, puis présente deux personnes imaginaires en utilisant il, elle et ils ou elles.'),

  topic('negation', 'Dire non', 'Grammaire', [
    ['Ne… pas', 'Not', 'Je ne suis pas professeur.'], ['Non', 'No', 'Non, je suis étudiant.'],
    ['Je ne sais pas', 'I do not know', 'Je ne sais pas son nom.'], ['Pas ici', 'Not here', 'La gare n’est pas ici.'],
  ], ['La négation', 'À l’écrit, place ne avant le verbe et pas après le verbe. Ne devient n’ devant une voyelle ou un h muet.', ['Je ne suis pas médecin.', 'Elle n’est pas française.', 'Nous ne sommes pas en classe.'], 'Garde les deux parties de la négation dans ces exercices écrits.'], [
    ['Mets « Elle est ici » à la forme négative.', ['Elle ne est pas ici.', 'Elle n’est pas ici.', 'Elle est ne pas ici.'], 'Elle n’est pas ici.'],
    ['Complète : Je ___ suis pas professeur.', ['ne', 'pas', 'non'], 'ne'],
    ['Quelle phrase est négative ?', ['Il est acteur.', 'Il est ici.', 'Il n’est pas acteur.'], 'Il n’est pas acteur.'],
  ], ['Écris trois phrases négatives avec être, puis une phrase affirmative.', 'Je ne suis pas médecin. Elle n’est pas ici. Nous ne sommes pas professeurs. Je suis étudiant.', ['J’ai écrit trois négations.', 'J’ai utilisé n’ devant est.', 'J’ai ajouté une affirmation.']], 'Un partenaire propose une profession ou une nationalité. Corrige avec « Non, je ne suis pas… Je suis… ».'),

  topic('articles', 'Articles et possession', 'Grammaire', [
    ['Le cahier', 'The notebook', 'Le cahier est ici.'], ['L’école', 'The school', 'L’école est à Lagos.'],
    ['Mon stylo', 'My pen', 'Voici mon stylo.'], ['Mes livres', 'My books', 'Mes livres sont ici.'],
  ], ['Articles définis et possessifs', 'Le, la, l’ et les désignent un élément identifié. Pour parler de possession, choisis mon/ma/mes, ton/ta/tes ou son/sa/ses selon le nom qui suit.', ['Un livre → le livre → mon livre.', 'Une table → la table → ta table.', 'Des livres → les livres → ses livres.'], 'Devant une voyelle ou un h muet au féminin, utilise mon, ton ou son : mon amie.'], [
    ['Complète : ___ école est ici.', ['Le', 'La', 'L’'], 'L’'],
    ['Complète : Ce sont ___ livres. (à moi)', ['mon', 'ma', 'mes'], 'mes'],
    ['Complète : Voici ___ table. (à toi)', ['ta', 'ton', 'tes'], 'ta'],
  ], ['Présente trois objets avec un article, puis indique leur propriétaire avec mon, ta ou ses.', 'Voici un stylo. C’est mon stylo. Voici une table. C’est ta table. Voici des livres. Ce sont ses livres.', ['J’ai présenté trois objets.', 'J’ai utilisé des articles adaptés.', 'J’ai accordé les possessifs avec les noms.']], 'Montre trois objets autour de toi et dis « C’est mon… », « C’est ta… » ou « Ce sont ses… ».'),

  topic('numbers', 'Les nombres', 'Vie quotidienne', [
    ['Zéro, un, deux, trois, quatre, cinq', 'Zero, one, two, three, four, five', 'J’ai cinq livres.'],
    ['Six, sept, huit, neuf, dix', 'Six, seven, eight, nine, ten', 'Il y a dix tables.'],
    ['Onze, douze, treize, quatorze, quinze, seize', 'Eleven, twelve, thirteen, fourteen, fifteen, sixteen', 'Elle a seize ans.'],
    ['Dix-sept, dix-huit, dix-neuf, vingt', 'Seventeen, eighteen, nineteen, twenty', 'J’ai vingt ans.'],
    ['Trente, quarante, cinquante, soixante', 'Thirty, forty, fifty, sixty', 'Il y a trente personnes.'],
  ], ['Compter et donner son âge', 'Pour donner ton âge, utilise avoir : j’ai, tu as, il/elle a. Les nombres servent aussi à compter les objets.', ['J’ai dix-huit ans.', 'Tu as vingt ans.', 'Il y a douze livres.'], 'On dit « J’ai vingt ans ».'], [
    ['Quel nombre correspond à 14 ?', ['Quarante', 'Quatorze', 'Quatre'], 'Quatorze'],
    ['Complète : J’___ vingt ans.', ['ai', 'suis', 'est'], 'ai'],
    ['Combien font dix et deux ?', ['Vingt', 'Onze', 'Douze'], 'Douze'],
  ], ['Écris un âge imaginaire et deux quantités. Écris les nombres en lettres.', 'J’ai dix-neuf ans. J’ai deux stylos. Il y a douze tables.', ['J’ai utilisé avoir pour l’âge.', 'J’ai donné deux quantités.', 'J’ai écrit les nombres en lettres.']], 'Compte de zéro à vingt, puis donne un âge imaginaire et le nombre de personnes dans ta classe.'),

  topic('calendar', 'Jours, dates et heures', 'Vie quotidienne', [
    ['Lundi, mardi, mercredi', 'Monday, Tuesday, Wednesday', 'Le cours est mardi.'],
    ['Jeudi, vendredi, samedi, dimanche', 'Thursday, Friday, Saturday, Sunday', 'Nous sortons samedi.'],
    ['Aujourd’hui', 'Today', 'Aujourd’hui, c’est lundi.'], ['À neuf heures', 'At nine o’clock', 'Le cours commence à neuf heures.'],
    ['Janvier, février, mars, avril, mai, juin', 'January, February, March, April, May, June', 'Mon anniversaire est en mai.'],
    ['Juillet, août, septembre, octobre, novembre, décembre', 'July, August, September, October, November, December', 'Le cours commence en septembre.'],
  ], ['Donner une date et une heure', 'Pour la date, utilise le suivi du nombre et du mois. Pour une heure de rendez-vous, utilise à.', ['Nous sommes le huit septembre.', 'C’est le premier mai.', 'Le cours est à neuf heures et demie.'], 'Utilise premier pour le premier jour du mois, puis deux, trois, etc.'], [
    ['Quel jour vient après mardi ?', ['Lundi', 'Mercredi', 'Dimanche'], 'Mercredi'],
    ['Comment écrit-on 9 h 30 ?', ['Neuf heures et demie', 'Neuf heures et quart', 'Dix heures'], 'Neuf heures et demie'],
    ['Complète : Le cours est ___ dix heures.', ['en', 'le', 'à'], 'à'],
  ], ['Propose un rendez-vous : indique le jour, la date et l’heure.', 'Rendez-vous mardi, le huit septembre, à dix heures.', ['J’ai indiqué un jour.', 'J’ai donné une date.', 'J’ai introduit l’heure avec à.']], 'Demande « Quel jour sommes-nous ? » et « Quelle heure est-il ? », puis propose une heure de rendez-vous.'),

  topic('feelings', 'Comment ça va ?', 'Premiers échanges', [
    ['Ça va bien', 'I am doing well', 'Merci, ça va bien.'], ['Fatigué / fatiguée', 'Tired', 'Je suis fatiguée.'],
    ['Content / contente', 'Happy', 'Il est content.'], ['S’il vous plaît', 'Please (polite)', 'Un stylo, s’il vous plaît.'],
    ['Excusez-moi', 'Excuse me (polite)', 'Excusez-moi, où est la gare ?'],
  ], ['Exprimer un état et rester poli', 'Utilise être avec un adjectif pour exprimer ton état. Choisis tu avec un proche et vous pour une formule polie.', ['Je suis contente.', 'Comment vas-tu ?', 'Comment allez-vous ?'], 'Adapte l’adjectif : fatigué / fatiguée, contents / contentes.'], [
    ['Quelle formule est polie ?', ['S’il vous plaît', 'À gauche', 'Dix livres'], 'S’il vous plaît'],
    ['Léa dit : Je suis…', ['fatigué', 'fatiguée', 'fatigués'], 'fatiguée'],
    ['Que répondre à « Comment ça va ? » ?', ['Le livre', 'À midi', 'Ça va bien, merci.'], 'Ça va bien, merci.'],
  ], ['Écris un court dialogue : salue une personne, demande comment elle va et remercie-la.', 'Bonjour ! Comment allez-vous ? Je vais bien, merci. Et vous ? Très bien, merci.', ['J’ai inclus une salutation.', 'J’ai demandé comment va la personne.', 'J’ai utilisé une formule de remerciement.']], 'Joue un dialogue avec un ami, puis avec un professeur. Adapte tu et vous.'),

  topic('preferences', 'Sports et préférences', 'Loisirs et sorties', [
    ['Le football', 'Football', 'J’aime le football.'], ['La natation', 'Swimming', 'Elle aime la natation.'],
    ['J’adore', 'I love', 'J’adore le tennis.'], ['Je n’aime pas', 'I do not like', 'Je n’aime pas le rugby.'],
  ], ['Dire ce qu’on aime', 'Avec aimer, adorer et détester, utilise un article défini devant une activité en général.', ['J’aime le tennis.', 'Tu aimes la natation.', 'Elle n’aime pas le football.'], 'Je aime devient j’aime.'], [
    ['Complète : J’aime ___ natation.', ['le', 'la', 'les'], 'la'],
    ['Quelle phrase exprime une préférence négative ?', ['J’adore le tennis.', 'J’aime le rugby.', 'Je n’aime pas le rugby.'], 'Je n’aime pas le rugby.'],
    ['Complète : Tu ___ le football.', ['aime', 'aimes', 'aimer'], 'aimes'],
  ], ['Présente deux sports que tu aimes et un sport que tu n’aimes pas.', 'J’aime le football. J’adore la natation. Je n’aime pas le rugby.', ['J’ai nommé trois sports.', 'J’ai utilisé les articles définis.', 'J’ai écrit une phrase négative.']], 'Demande à un partenaire quels sports il aime. Compare ses préférences aux tiennes.'),

  topic('outings', 'Proposer une sortie', 'Loisirs et sorties', [
    ['Le cinéma', 'The cinema', 'Je vais au cinéma.'], ['Le musée', 'The museum', 'Nous allons au musée.'],
    ['Avec plaisir', 'With pleasure', 'Oui, avec plaisir !'], ['Désolé / désolée', 'Sorry', 'Désolée, je ne suis pas libre.'],
  ], ['Aller et proposer un lieu', 'Utilise aller pour indiquer une destination : je vais, tu vas, il/elle va, nous allons, vous allez, ils/elles vont.', ['Je vais au cinéma.', 'Elle va à la gare.', 'Nous allons à l’école.'], 'À + le devient au ; à + les devient aux.'], [
    ['Complète : Nous ___ au musée.', ['vais', 'allons', 'va'], 'allons'],
    ['Complète : Je vais ___ cinéma.', ['à le', 'à la', 'au'], 'au'],
    ['Quelle réponse accepte une invitation ?', ['Avec plaisir !', 'Je ne suis pas libre.', 'Désolé, non.'], 'Avec plaisir !'],
  ], ['Invite un ami à sortir. Propose un lieu, un jour et une heure.', 'Salut Nina ! Tu es libre samedi ? On va au cinéma à quinze heures ?', ['J’ai invité une personne.', 'J’ai proposé un lieu.', 'J’ai précisé un jour et une heure.']], 'Invite un partenaire au musée. Il accepte ou refuse poliment, puis vous échangez les rôles.'),

  topic('messages', 'Emails et formulaires', 'Vie quotidienne', [
    ['Le nom de famille', 'The surname', 'Mon nom de famille est Bello.'], ['Le prénom', 'The first name', 'Mon prénom est Ada.'],
    ['Une adresse électronique', 'An email address', 'Mon adresse est ada@example.com.'], ['Cordialement', 'Kind regards', 'Cordialement, Ada Bello.'],
  ], ['S’appeler et donner ses coordonnées', 'Pour donner un nom, utilise je m’appelle, tu t’appelles ou il/elle s’appelle. Dans un formulaire, distingue prénom et nom de famille.', ['Je m’appelle Ada Bello.', 'Tu t’appelles Nina.', 'Elle s’appelle Léa.'], 'Pour les exercices, invente tes coordonnées. Un email simple contient une salutation, un message et une signature.'], [
    ['Ada Bello : quel est son prénom ?', ['Bello', 'Ada', 'Ada Bello'], 'Ada'],
    ['Complète : Tu ___ Nina.', ['m’appelle', 's’appelle', 't’appelles'], 't’appelles'],
    ['Quelle formule termine un email poli ?', ['Cordialement', 'Quel âge ?', 'Prénom'], 'Cordialement'],
  ], ['Écris un email pour te présenter à un professeur. Invente ton nom et ton adresse électronique.', 'Bonjour Madame, je m’appelle Ada Bello. Je suis étudiante. Mon adresse est ada@example.com. Cordialement, Ada.', ['J’ai salué le destinataire.', 'J’ai donné un nom et une adresse inventés.', 'J’ai terminé par une formule polie et une signature.']], 'Joue une inscription : donne un nom inventé, épelle-le et indique une adresse électronique fictive.'),

  topic('francophonie', 'La francophonie', 'Culture', [
    ['Francophone', 'French-speaking', 'Une personne francophone parle français.'], ['Une langue', 'A language', 'Le français est une langue.'],
    ['Le Sénégal', 'Senegal', 'Dakar est au Sénégal.'], ['Le Québec', 'Quebec', 'Montréal est au Québec.'],
  ], ['Parler des langues et des lieux', 'Le français se parle dans plusieurs régions du monde, où il peut coexister avec d’autres langues. Utilise en avec France, au avec Sénégal et à avec un nom de ville.', ['J’habite en France.', 'Elle habite au Sénégal.', 'Il habite à Montréal, au Québec.'], 'Le Québec est une province du Canada. Francophone ne veut pas dire français de nationalité.'], [
    ['Une personne francophone parle…', ['français', 'uniquement anglais', 'toutes les langues'], 'français'],
    ['Complète : Dakar est ___ Sénégal.', ['en', 'au', 'à'], 'au'],
    ['Le Québec est…', ['une ville de France', 'un pays européen', 'une province du Canada'], 'une province du Canada'],
  ], ['Présente une personne francophone imaginaire : donne son nom, son lieu de résidence et une langue qu’elle parle.', 'Elle s’appelle Awa. Elle habite à Dakar, au Sénégal. Elle parle français.', ['J’ai inventé une personne.', 'J’ai situé son lieu de résidence.', 'J’ai nommé une langue.']], 'Présente une ville francophone à partir des exemples de la leçon. Dis où elle se trouve.'),
]

const coreDetails = [
  ['introductions', 'Premiers échanges', ['J’ai donné mon prénom.', 'J’ai indiqué ma nationalité.', 'J’ai présenté ma profession ou mes études.'], 'Présente-toi en trois phrases, puis demande son prénom à un partenaire.'],
  ['classroom', 'Vie quotidienne', ['J’ai décrit trois objets.', 'J’ai utilisé un, une et des.', 'J’ai accordé les articles avec les noms.'], 'Nomme trois objets de ta classe, puis donne une consigne simple à un partenaire.'],
  ['town', 'Loisirs et sorties', ['J’ai décrit trois lieux.', 'J’ai utilisé devant et derrière.', 'J’ai utilisé à côté de.'], 'Explique à un partenaire où se trouve la gare. Utilise à gauche et tout droit.'],
]

const baseLessons = [
  ...coreLessons.map((lesson, index) => ({ ...lesson, id: coreDetails[index][0], category: coreDetails[index][1], writing: { ...lesson.writing, rubric: coreDetails[index][2] }, speaking: coreDetails[index][3] })),
  ...additionalLessons,
]

export const lessons = sequence.map(id => improveCards(alignTextbook(deepen(baseLessons.find(lesson => lesson.id === id)))))
