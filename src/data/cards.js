// English translations belong to the example, not to the recall prompt.
const examples = {
  alphabet: ['Can you spell your name?', 'École (school) begins with é.', 'Très (very) contains è.', 'Français (French) contains ç.', 'Fête (party) contains ê.', 'Noël (Christmas) contains ë.', 'Speak more slowly, please.', 'Excuse me, can you repeat?', 'Break the word into syllables.', 'In deux amis (two friends), a z sound links the words.'],
  introductions: ['Hello, my name is Léa.', 'My name is Karim.', 'Nice to meet you; I’m Nina.', 'Good evening, Madam.', 'Goodbye, see you tomorrow!', 'I am a student. And you?', 'Thank you, see you soon!', 'Goodbye, have a good day!', 'This is my friend.', 'My business card has my name and profession on it.'],
  pronouns: ['We are in class.', 'You are a teacher.', 'They are students.', 'They are friends.', 'I am here.', 'You are in class.', 'We are together.', 'Nina and Léa are happy.', 'I’m here. And you?', 'I speak with him and with her.', 'They are students.'],
  countries: ['I am from Nigeria.', 'She lives in France.', 'Ada is Nigerian.', 'Léa is French.', 'Marc is Canadian.', 'Awa is Senegalese.', 'She is Belgian.', 'I am Nigerian and I live in Lagos.', 'Mexico is a country.', 'He lives in the Netherlands.', 'She is Greek.', 'They are Turkish.', 'They are Chinese.', 'Nina is Italian.'],
  professions: ['He is a doctor.', 'She is a student.', 'He is a teacher.', 'I work in Lagos.', 'Nina is an actress.', 'She is a nurse.', 'He is a waiter.', 'I am a student and I study French.', 'Inès is an architect.', 'She is a singer.', 'Hugo is a pastry chef.', 'Salma is a journalist.', 'I am a photographer.'],
  feelings: ['Thank you, I’m doing well.', 'I am tired.', 'He is happy.', 'A pen, please.', 'Excuse me, where is the station?', 'I am hungry; I would like to eat.', 'I am thirsty; a glass of water, please.', 'Today, I’m feeling so-so.', 'Thank you! — You’re welcome.', 'You have a lot of work: keep going!', 'Good luck with your exam!', 'Goodbye and have a good holiday!', 'The meal is ready: enjoy your meal!', 'I would like a tea, please.', 'Thank you. — You’re welcome.'],
  classroom: ['Open your book.', 'Listen to the teacher.', 'Repeat the sentence.', 'It is an eraser.', 'There are three chairs.', 'Open the book at page ten.', 'Write your first name.', 'Excuse me, I do not understand.', 'My pencil case is blue.', 'The scissors are in the pencil case.', 'I am looking for my keys.', 'My glasses are on the book.', 'Draw a square, then a rectangle.', 'The sign is a triangle.', 'The pencil case is blue.', 'The notebook is green.', 'The card is red and the notebook is yellow.', 'The sheet of paper is white.', 'The bag is black.', 'My telephone is in my bag.', 'I am looking for my wallet.', 'Here is my fictional identity document.'],
  articles: ['The notebook is here.', 'The school is in Lagos.', 'Here is my pen.', 'My books are here.', 'Paul shows his table.', 'Nina introduces her friend.', 'Our class is here.', 'Open your notebooks.', 'Their book and their notebooks are here.', 'Whose keys are these?', 'My clothes are in my suitcase.'],
  negation: ['I am not a teacher.', 'No, I am a student.', 'I do not know his/her name.', 'The station is not here.', 'I do not have a book today.', 'It is not an eraser.', 'She does not like tennis.', 'My name is not Paul.', 'I no longer play tennis.', 'I never go skiing.', 'I am doing nothing this morning.'],
  numbers: ['I have five books.', 'There are ten tables.', 'She is sixteen years old.', 'I am twenty years old.', 'There are thirty people.', 'I am twenty-one years old.', 'There are seventy pages.', 'The ticket costs eighty euros.', 'There are one hundred people.', 'How old are you?', 'Which languages do you speak?', 'How many people are there?'],
  calendar: ['The class is on Tuesday.', 'We are going out on Saturday.', 'Today is Monday.', 'The class starts at nine o’clock.', 'My birthday is in May.', 'The class starts in September.', 'It is quarter past ten (10:15).', 'It is quarter to eleven (10:45).', 'We eat at noon.', 'The class runs from nine to eleven.', 'We’ll meet tomorrow.', 'Seven o’clock is early for me.', 'The showing starts at 18:30 (6:30 p.m.).', 'I am free in the afternoon.'],
  preferences: ['I like football.', 'She likes swimming.', 'I love tennis.', 'I do not like rugby.', 'I prefer swimming.', 'I like this sport because it is fun.', 'I play tennis.', 'I go swimming on Saturdays.', 'I go hiking.', 'She likes drawing.', 'I like reading.', 'He does DIY.', 'We sew.', 'I like painting.', 'We do sport; you draw.', 'She goes skiing.', 'We go mountain biking.', 'He jogs in the morning.', 'You play basketball.', 'She makes sculptures.'],
  town: ['The station is here.', 'Turn left.', 'Continue straight ahead.', 'Turn right.', 'The museum is opposite the café.', 'The station is next to the museum.', 'Continue, then turn left.', 'Is the station far away?'],
  outings: ['I am going to the cinema.', 'We are going to the museum.', 'Yes, I’d love to!', 'Sorry, I am not free.', 'Are you free on Sunday?', 'Sunday works for me.', 'Meet in front of the museum.', 'Not Saturday. How about Sunday?', 'We are going to the swimming pool.', 'They are going to the ice rink.', 'I am going to the library.', 'The show is at the theatre.'],
  messages: ['My surname is Bello.', 'My first name is Ada.', 'My email address is ada@example.com.', 'Kind regards, Ada Bello.', 'Subject: Course registration.', 'Enter a fictional date of birth.', 'I am requesting registration for the course.', 'Thank you for your reply. Kind regards, Ada.', 'Enter a fictional email address.', 'The title is a field on the form.', 'I would like the workshop programme.'],
  francophonie: ['A French-speaking person speaks French.', 'French is a language.', 'Dakar is in Senegal.', 'Montréal is in Quebec.', 'A multilingual person speaks several languages.', 'What is your first language?', 'Brussels is in Belgium.', 'I speak French and English.'],
}

const accentCards = {
  1: ['é — Quel accent ?', 'Un accent aigu — the rising mark over e (é).'],
  2: ['è — Quel accent ?', 'Un accent grave — the falling mark over e (è); also used on à and ù.'],
  3: ['ç — Quel signe ?', 'Une cédille — the mark below c; it gives c an s sound before a, o or u.'],
  4: ['ê — Quel accent ?', 'Un accent circonflexe — the little roof over a vowel: â, ê, î, ô, û.'],
  5: ['ë — Quel signe ?', 'Un tréma — two dots over a vowel; in Noël the vowels are pronounced separately.'],
  8: ['Une syllabe', 'A beat in a spoken word: café has two, ca-fé.'],
  9: ['Une liaison', 'A normally silent final consonant sounds before the next vowel: deux amis → a linking z sound.'],
}
const names = ['a','bé','cé','dé','e','effe','gé','ache','i','ji','ka','elle','emme','enne','o','pé','ku','erre','esse','té','u','vé','double vé','iks','i grec','zède']
const pronunciation = ['ah', 'bay', 'say', 'day', 'uh, with rounded lips', 'eff', 'zhay', 'ash', 'ee', 'zhee', 'kah', 'ell', 'emm', 'enn', 'oh', 'pay', 'k + the French u sound', 'a French r, made at the back of the mouth', 'ess', 'tay', 'say ee with rounded lips', 'vay', 'the French words double + vé', 'eeks', 'ee grek', 'zed']
const letters = names.map((name, i) => {
  const letter = String.fromCharCode(65 + i)
  return { front: `${letter} ${letter.toLowerCase()}`, back: `${letter} se dit « ${name} »`, tag: 'Nom de la lettre', prompt: 'Comment se dit cette lettre en français ?', example: `Pour épeler, dis « ${name} ».`, exampleEn: `When spelling, say the French letter name “${name}”. Rough English sound guide: ${pronunciation[i]}.`, note: 'Sound guides are approximate: keep vowels steady rather than gliding; zh is the sound in “vision”. A letter’s name can differ from its sound inside a word.' + (letter === 'U' || letter === 'Q' ? ' French u is different from ou (roughly English oo).' : letter === 'E' ? ' This plain e is different from é (as in café).' : letter === 'G' || letter === 'J' ? ' Watch G and J: their French names are gé and ji.' : '') }
})
const numberWords = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt']
const numberCards = numberWords.map((word, i) => ({ front: word, back: String(i), tag: 'Un nombre', example: `${i} s’écrit « ${word} ».`, exampleEn: `The number ${i} is written “${word}” in French.` }))
for (const [word, number] of [['trente',30], ['quarante',40], ['cinquante',50], ['soixante',60]]) numberCards.push({ front: word, back: String(number), tag: 'Une dizaine', example: `${number} s’écrit « ${word} ».`, exampleEn: `The number ${number} is written “${word}” in French.` })
const days = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']
const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const dates = [...days, ...months].map((word, i) => ({ front: word, back: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','January','February','March','April','May','June','July','August','September','October','November','December'][i], tag: i < 7 ? 'Un jour' : 'Un mois', example: i < 7 ? `Le cours est ${word}.` : `Mon anniversaire est en ${word}.`, exampleEn: i < 7 ? `The class is on ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]}.` : `My birthday is in ${['January','February','March','April','May','June','July','August','September','October','November','December'][i - 7]}.` }))

export const cardOffsets = { alphabet: letters.length, numbers: numberCards.length, calendar: dates.length }
export function improveCards(lesson) {
  const cards = lesson.cards.map((card, i) => {
    const result = { ...card, exampleEn: examples[lesson.id][i] }
    if (lesson.id === 'alphabet' && accentCards[i]) [result.front, result.back] = accentCards[i]
    if ((lesson.id === 'numbers' && i < 5) || (lesson.id === 'calendar' && [0,1,4,5].includes(i))) result.tag = 'Récapitulatif — plusieurs mots'
    if (card.front.includes(' / ')) result.note = 'The two French forms match the English meanings in the same order.'
    if (['countries','professions','feelings'].includes(lesson.id) && card.front.includes(' / ')) result.note = 'The first form is masculine; the second is feminine. Both have the same basic meaning. Match the form to the person you describe.'
    if (lesson.id === 'classroom' && [14,15,17,18].includes(i)) result.note = 'The first colour form goes with a masculine noun; the second goes with a feminine noun: un cahier vert, une trousse verte.'
    if (lesson.id === 'articles') result.note = 'Choose the possessive form to match the thing possessed, not the owner’s gender. Sa table can mean his table or her table; son amie uses son before a vowel.'
    if (lesson.id === 'professions') result.note = 'The article helps you learn the noun. In a simple statement of profession with être, omit it: Il est médecin = He is a doctor.'
    if (lesson.id === 'pronouns' && i === 1) result.back = 'You are — vous addresses several people, or one person politely.'
    if (lesson.id === 'pronouns' && i >= 8) result.note = 'These forms stand alone, add emphasis, or follow a preposition: Et toi ? = And you? Avec lui = With him. Use je/tu/il… as ordinary verb subjects.'
    if (lesson.id === 'negation') result.note = 'Put ne before the verb and pas, plus, jamais or rien after it. Ne becomes n’ before a vowel: Je n’ai pas de livre.'
    if (lesson.id === 'messages' && i === 9) result.back = 'Title on a form, such as Madame (Ms/Mrs) or Monsieur (Mr).'
    if (lesson.id === 'numbers' && i === 6) result.note = 'In the French number system used here, 70 is 60 + 10: soixante-dix.'
    if (lesson.id === 'numbers' && i === 7) result.note = '80 is four twenties: quatre-vingts. Drop the final s when another number follows: quatre-vingt-un (81).'
    if (lesson.id === 'feelings' && [5,6].includes(i)) result.note = 'French uses avoir (to have) here: j’ai faim / soif. Learn the whole expression; English uses “I am hungry / thirsty”.'
    if (lesson.id === 'alphabet' && i === 8) result.example = 'Café : ca-fé, deux syllabes.'
    if (lesson.id === 'alphabet' && i === 8) result.exampleEn = 'Café has two spoken beats: ca-fé.'
    return result
  })
  if (lesson.id === 'alphabet') cards.push(...[
    ['Lina', 'L – I – N – A', 'elle – i – enne – a'],
    ['Léa', 'L – É – A', 'elle – e accent aigu – a'],
    ['Noël', 'N – O – Ë – L', 'enne – o – e tréma – elle'],
  ].map(([name, spelling, spoken]) => ({ front: `Épelle « ${name} »`, back: spelling, tag: 'Épeler un prénom', prompt: 'Dis les lettres dans l’ordre, avec les accents.', example: `À voix haute : ${spoken}.`, exampleEn: `Spell ${name} aloud, naming each letter and any accent: ${spoken}.` })))
  return { ...lesson, cards: [...(lesson.id === 'alphabet' ? letters : lesson.id === 'numbers' ? numberCards : lesson.id === 'calendar' ? dates : []), ...cards] }
}
