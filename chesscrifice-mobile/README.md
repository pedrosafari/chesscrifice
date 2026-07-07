Para executar o jogo com a IA dos monstros, extraia o arquivo `stockfish.zip` nesta mesma pasta.

Depois de extrair, a estrutura deve ficar assim:

chesscrifice-api/
└── engines/
└── stockfish.exe

O backend Spring Boot espera encontrar o executável exatamente neste caminho:

chesscrifice-api/engines/stockfish.exe
