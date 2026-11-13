export type Article = { id: string; icon: string; title: string; summary: string; sections: { h: string; t: string }[] };

export const SOURCES =
  "Fontes para consulta: bula oficial do medicamento (Bulário Eletrônico da Anvisa – consulta.anvisa.gov.br), informações da Anvisa, Guia Alimentar para a População Brasileira (Ministério da Saúde) e orientação do seu médico ou nutricionista. Este conteúdo é educativo e não substitui o acompanhamento profissional.";

export const articles: Article[] = [
  { id: "k1", icon: "🧬", title: "Como funciona a tirzepatida", summary: "Entenda o mecanismo do medicamento.",
    sections: [
      { h: "Ação no organismo", t: "A tirzepatida é uma medicação injetável que atua em dois receptores de hormônios intestinais: GIP e GLP-1. Esses hormônios participam da regulação da glicose, do apetite e da saciedade." },
      { h: "Efeitos esperados", t: "Em geral, a pessoa sente mais saciedade, o esvaziamento do estômago fica mais lento e o apetite diminui. Isso pode ajudar na redução de peso quando combinado com alimentação adequada e atividade física." },
      { h: "Uso sob prescrição", t: "Dose, frequência e duração do tratamento são definidas exclusivamente pelo médico. O Minha Vida Menor apenas registra o que foi prescrito e nunca sugere doses ou ajustes." },
    ] },
  { id: "k2", icon: "💉", title: "Cuidados com as aplicações", summary: "Boas práticas gerais de aplicação.",
    sections: [
      { h: "Local de aplicação", t: "A bula orienta aplicar por via subcutânea no abdômen, na coxa ou na parte superior do braço. É comum alternar o ponto de aplicação a cada dose para reduzir irritações na pele. O mapa corporal do aplicativo ajuda a visualizar o histórico, mas a escolha do local deve seguir a bula e o seu médico." },
      { h: "Antes de aplicar", t: "Lave as mãos, confira o nome do medicamento e a validade, e observe se a solução está límpida e sem partículas. Siga o passo a passo da caneta descrito na bula e use sempre agulha nova, conforme instruções do fabricante." },
      { h: "Descarte", t: "Descarte agulhas usadas em recipiente rígido e resistente a perfurações, conforme orientações locais de descarte de perfurocortantes." },
      { h: "Reações no local", t: "Vermelhidão leve, coceira ou pequeno hematoma podem ocorrer. Registre no aplicativo e comunique ao profissional caso sejam intensas, persistentes ou com sinais de infecção." },
    ] },
  { id: "k3", icon: "🧊", title: "Armazenamento", summary: "Como conservar a caneta.",
    sections: [
      { h: "Geladeira", t: "As canetas lacradas geralmente devem ser guardadas na geladeira (2 °C a 8 °C), na prateleira e nunca no congelador. Não utilize se tiver sido congelada." },
      { h: "Fora da geladeira", t: "Segundo a bula do Mounjaro, a caneta pode ficar fora da geladeira, em temperatura de até 30 °C, por até 21 dias. Confira sempre a bula da sua marca e apresentação." },
      { h: "Proteção", t: "Mantenha a caneta na embalagem original, protegida da luz e do calor, e longe do alcance de crianças. Em viagens, use bolsa térmica sem contato direto com gelo." },
    ] },
  { id: "k4", icon: "🥗", title: "Alimentação durante o tratamento", summary: "Comer bem, sem restrições extremas.",
    sections: [
      { h: "Refeições menores e frequentes", t: "Com a saciedade aumentada, muitas pessoas preferem porções menores. Coma devagar, mastigue bem e pare quando se sentir satisfeito." },
      { h: "Qualidade importa", t: "Priorize alimentos in natura ou minimamente processados: legumes, verduras, frutas, grãos integrais, leguminosas, ovos, carnes magras e peixes. Gorduras e frituras em excesso podem piorar náuseas e refluxo." },
      { h: "Evite restrições excessivas", t: "Comer muito pouco pode causar fraqueza, perda de massa muscular e deficiências de nutrientes. Pouco apetite persistente deve ser comunicado ao médico ou nutricionista." },
    ] },
  { id: "k5", icon: "🍗", title: "Proteínas", summary: "Por que elas são tão importantes.",
    sections: [
      { h: "Função", t: "As proteínas ajudam a manter a massa muscular, a saciedade e a recuperação do corpo. Em processos de emagrecimento, garantir proteína adequada é uma estratégia importante." },
      { h: "Fontes", t: "Ovos, frango, peixes, carnes magras, laticínios, leguminosas (feijão, lentilha, grão-de-bico) e tofu. Distribua ao longo do dia." },
      { h: "Quantidade", t: "A necessidade varia conforme idade, peso, rins e atividade física. O nutricionista define a meta individual." },
    ] },
  { id: "k6", icon: "🌾", title: "Fibras", summary: "Intestino funcionando bem.",
    sections: [
      { h: "Benefícios", t: "Fibras ajudam no funcionamento intestinal e na saciedade, e contribuem para o controle da glicose." },
      { h: "Constipação", t: "A constipação é um efeito comum. Aumente fibras (frutas com casca, verduras, aveia, chia, leguminosas) de forma gradual, junto com água suficiente e movimento." },
      { h: "Atenção", t: "Se houver dor abdominal intensa, distensão importante ou ausência de evacuação por vários dias, procure atendimento." },
    ] },
  { id: "k7", icon: "💧", title: "Hidratação", summary: "Água ao longo do dia.",
    sections: [
      { h: "Por que beber água", t: "Náuseas, vômitos, diarreia e menor ingestão de alimentos aumentam o risco de desidratação, que pode afetar os rins." },
      { h: "Como se organizar", t: "Beba pequenos goles ao longo do dia e use os lembretes do aplicativo. A meta de água é pessoal; converse com o médico, especialmente se tem problemas renais ou cardíacos." },
      { h: "Sinais de desidratação", t: "Boca seca, urina escura e escassa, tontura, fraqueza e batimentos acelerados. Se persistirem, procure atendimento." },
    ] },
  { id: "k8", icon: "💪", title: "Preservação da massa muscular", summary: "Perder gordura, manter músculos.",
    sections: [
      { h: "Risco", t: "Durante a perda de peso, parte do que se perde pode ser massa magra. Alimentação pobre em proteínas e sedentarismo aumentam esse risco." },
      { h: "O que ajuda", t: "Treino de força (musculação ou exercícios com o peso do corpo) 2 a 3 vezes por semana, proteína adequada, sono regular e acompanhamento com profissional de educação física." },
      { h: "Medidas", t: "Acompanhe cintura, braços e coxas, além do peso. O percentual de gordura, quando medido, também ajuda a interpretar a evolução." },
    ] },
  { id: "k9", icon: "⚠️", title: "Efeitos adversos", summary: "O que é comum e o que exige atenção.",
    sections: [
      { h: "Mais comuns", t: "Náuseas, diarreia, vômitos, constipação, azia/dispepsia, dor abdominal, redução do apetite e fadiga. Costumam ser mais frequentes no início e após aumentos de dose, e tendem a melhorar." },
      { h: "Como aliviar (geral)", t: "Refeições menores, comer devagar, evitar frituras e alimentos muito gordurosos ou doces, beber líquidos e não deitar logo após comer. Qualquer medicação para alívio deve ser orientada pelo médico." },
      { h: "Procure atendimento se", t: "Houver dor forte e persistente no abdômen (podendo irradiar para as costas), vômitos repetidos que impedem hidratação, sinais de reação alérgica (inchaço de rosto/língua, falta de ar), icterícia, dor no lado direito superior do abdômen, caroço no pescoço, dificuldade para engolir ou rouquidão persistente, ou sinais de desidratação." },
    ] },
  { id: "k10", icon: "🩺", title: "Cuidados durante o tratamento", summary: "Atenções importantes.",
    sections: [
      { h: "Informe seu médico", t: "Avise sobre todos os medicamentos em uso (principalmente insulina ou medicamentos para diabetes, pela possibilidade de hipoglicemia), gravidez ou planejamento de gravidez, e histórico de pancreatite, doenças da vesícula ou tireoide." },
      { h: "Contraceptivos orais", t: "A bula do Mounjaro informa que a tirzepatida pode reduzir a eficácia de contraceptivos orais. Converse com seu médico sobre métodos adicionais." },
      { h: "Anestesia e procedimentos", t: "Avise a equipe médica que você usa esse medicamento antes de cirurgias ou endoscopias, pois ele retarda o esvaziamento do estômago." },
      { h: "Sono e emoções", t: "Observe humor, sono e relação com a comida. Mudanças emocionais merecem conversa com profissionais de saúde." },
    ] },
  { id: "k11", icon: "⏰", title: "Esquecimento de aplicações", summary: "O que fazer se esquecer uma dose.",
    sections: [
      { h: "Orientação geral da bula", t: "No caso do Mounjaro, a bula orienta que, se uma dose for esquecida, ela seja aplicada o mais rápido possível dentro de 4 dias (96 horas) após o esquecimento. Se já se passaram mais de 4 dias, pule a dose esquecida e aplique a próxima no dia habitual. Não aplique duas doses em um intervalo menor que 3 dias." },
      { h: "Confirme com o profissional", t: "As regras podem variar conforme o medicamento, a marca e o caso. Consulte a bula do seu produto e fale com seu médico. O aplicativo não decide por você: ele mostra apenas a data prevista pela programação que você cadastrou." },
      { h: "Dica", t: "Use os lembretes e registre a aplicação logo depois de fazê-la." },
    ] },
  { id: "k12", icon: "👩‍⚕️", title: "Importância do acompanhamento profissional", summary: "Você não está sozinho.",
    sections: [
      { h: "Equipe", t: "Médico, nutricionista, profissional de educação física e psicólogo podem trabalhar juntos para um emagrecimento seguro e sustentável." },
      { h: "Consultas e exames", t: "Mantenha consultas e exames periódicos. Use o calendário e o relatório mensal do aplicativo para levar informações organizadas à consulta." },
      { h: "Metas realistas", t: "Perdas de peso graduais e sustentáveis são mais seguras. Evite comparações e metas extremas." },
    ] },
];

export const messages = [
  "Um passo de cada vez. Cuidar de você é um processo, não uma corrida.",
  "Constância vale mais que perfeição. Hoje já é um bom dia para cuidar de si.",
  "Seu corpo está trabalhando com você. Seja gentil consigo mesmo(a).",
  "Beber água, se movimentar e descansar também são conquistas.",
  "Pequenas escolhas repetidas todos os dias criam grandes mudanças.",
  "Não compare seu caminho com o de outras pessoas. Cada corpo tem seu ritmo.",
  "Comer bem é nutrir, não punir. Escolha alimentos que façam bem a você.",
  "A balança é só um dado. Energia, sono e disposição também contam.",
  "Um dia difícil não apaga seu progresso. Recomece com carinho.",
  "Proteína, fibras e hidratação: a base de um dia mais leve.",
  "Você merece um tratamento seguro e sustentável. Fale com sua equipe de saúde sempre que precisar.",
  "Mexer o corpo faz bem para a mente. Uma caminhada curta já ajuda.",
  "Celebre as conquistas que não aparecem na balança: roupas mais soltas, mais disposição.",
  "Respeite sua fome e sua saciedade. Comer devagar é um ótimo hábito.",
  "Acompanhar seus registros é um ato de cuidado.",
  "Descanso faz parte do processo. Durma bem hoje.",
  "Ritmo saudável é aquele que você consegue manter.",
  "Hoje, escolha uma pequena ação que o seu eu do futuro vai agradecer.",
  "Perder peso devagar e com saúde é mais seguro do que perder rápido.",
  "Você já começou, e isso é o mais difícil. Continue!",
];

export const alertSigns = [
  "Dor forte e persistente na barriga, com ou sem vômitos, que pode irradiar para as costas",
  "Vômitos repetidos ou diarreia intensa com sinais de desidratação (urina muito escura, tontura, fraqueza)",
  "Reação alérgica: inchaço de rosto, lábios ou língua, falta de ar, urticária",
  "Amarelamento da pele ou dos olhos, ou dor no lado direito superior da barriga",
  "Batimentos acelerados, desmaio, suor frio ou tremores (possível hipoglicemia, principalmente se usar insulina)",
  "Caroço no pescoço, rouquidão persistente ou dificuldade para engolir",
  "Reação intensa no local da aplicação: vermelhidão que se espalha, calor, pus ou febre",
  "Pensamentos de se machucar ou sofrimento emocional intenso",
];
