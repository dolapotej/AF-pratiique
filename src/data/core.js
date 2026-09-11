const cards = [
  { front: 'Bonjour', back: 'Hello / Good morning', tag: 'Salutations', example: 'Bonjour, je m’appelle Léa.' },
  { front: 'Comment tu t’appelles ?', back: 'What is your name?', tag: 'Conversation', example: 'Je m’appelle Karim.' },
  { front: 'Enchanté(e)', back: 'Nice to meet you', tag: 'Expressions', example: 'Enchantée, moi c’est Nina.' },
]
const quiz = [
  { question: 'Comment dit-on “Good evening” ?', options: ['Bonjour', 'Bonsoir', 'Salut'], answer: 'Bonsoir' },
  { question: '“Je m’appelle Hugo” signifie…', options: ['My name is Hugo', 'I live in Hugo', 'I like Hugo'], answer: 'My name is Hugo' },
  { question: 'Que signifie “Enchanté(e)” ?', options: ['See you soon', 'Nice to meet you', 'Good night'], answer: 'Nice to meet you' },
]
const grammar = { title: 'Se présenter avec être', explanation: 'Pour donner une nationalité ou une profession, utilise le verbe être.', examples: ['Je suis française.', 'Il est acteur.', 'Elle est étudiante.'], note: 'La nationalité s’accorde : français / française.' }
const writing = { prompt: 'Présente-toi en trois phrases. Donne ton prénom, ta nationalité et ta profession ou tes études.', model: 'Je m’appelle Lina. Je suis nigériane. Je suis étudiante.' }
export const coreLessons = [
  { title: 'Se présenter', subtitle: 'Salutations et identité', color: 'coral', cards, quiz, grammar, writing },
  {
    title: 'En classe', subtitle: 'Objets et consignes', color: 'blue',
    cards: [
      { front: 'Un livre', back: 'A book', tag: 'Objets', example: 'Ouvrez votre livre.' },
      { front: 'Écoutez', back: 'Listen', tag: 'Consignes', example: 'Écoutez le professeur.' },
      { front: 'Répétez', back: 'Repeat', tag: 'Consignes', example: 'Répétez la phrase.' },
    ],
    quiz: [
      { question: 'Que signifie « Un livre » ?', options: ['A book', 'A pen', 'A chair'], answer: 'A book' },
      { question: 'Comment dit-on « Listen » ?', options: ['Écrivez', 'Écoutez', 'Répétez'], answer: 'Écoutez' },
      { question: 'Que signifie « Répétez » ?', options: ['Read', 'Write', 'Repeat'], answer: 'Repeat' },
    ],
    grammar: { title: 'Les articles indéfinis', explanation: 'Utilise un avec un nom masculin, une avec un nom féminin et des au pluriel.', examples: ['Un livre.', 'Une table.', 'Des stylos.'], note: 'Apprends chaque nom avec son article.' },
    writing: { prompt: 'Décris trois objets de ta classe. Utilise un, une et des.', model: 'Il y a un livre. Il y a une table. Il y a des stylos.' },
  },
  {
    title: 'Ma ville', subtitle: 'Lieux et directions', color: 'yellow',
    cards: [
      { front: 'La gare', back: 'The train station', tag: 'Lieux', example: 'La gare est ici.' },
      { front: 'À gauche', back: 'To the left', tag: 'Directions', example: 'Tournez à gauche.' },
      { front: 'Tout droit', back: 'Straight ahead', tag: 'Directions', example: 'Continuez tout droit.' },
    ],
    quiz: [
      { question: 'Que signifie « La gare » ?', options: ['The school', 'The train station', 'The park'], answer: 'The train station' },
      { question: 'Comment dit-on « To the left » ?', options: ['À droite', 'Tout droit', 'À gauche'], answer: 'À gauche' },
      { question: 'Que signifie « Tout droit » ?', options: ['Straight ahead', 'To the left', 'Behind'], answer: 'Straight ahead' },
    ],
    grammar: { title: 'Situer un lieu', explanation: 'Utilise devant, derrière ou à côté de pour situer un lieu.', examples: ['La gare est devant le parc.', 'Le café est derrière la gare.', 'Le parc est à côté de la gare.'], note: 'À côté de + le devient à côté du.' },
    writing: { prompt: 'Décris trois lieux de ta ville. Utilise devant, derrière et à côté de.', model: 'La gare est devant le parc. Le café est derrière la gare. Le parc est à côté de la gare.' },
  },
]
