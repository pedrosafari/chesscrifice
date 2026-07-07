# Stockfish

O executável `stockfish.exe` não está versionado neste repositório porque ultrapassa o limite de tamanho permitido pelo GitHub para arquivos comuns.

Para executar a integração com o motor de xadrez, coloque o arquivo manualmente nesta pasta:

chesscrifice-api/engines/stockfish.exe

Estrutura esperada:

chesscrifice-api/
└── engines/
    └── stockfish.exe

Sem esse arquivo, o backend continuará funcionando, mas a jogada automática do monstro pelo Stockfish não será executada corretamente.
