import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
MIGRACOES = RAIZ / "backend" / "src" / "main" / "resources" / "db" / "migration"
DADOS_E_EXEMPLOS = [
    RAIZ / "database" / "seeds" / "inserts.sql",
    RAIZ / "database" / "tests" / "teste_triggers.sql",
    RAIZ / "database" / "tests" / "teste_auditoria.sql",
    RAIZ / "database" / "queries" / "transacoes.sql",
    RAIZ / "database" / "queries" / "selects.sql",
    RAIZ / "database" / "queries" / "consultas.sql",
]
SAIDA_SCHEMA = RAIZ / "database" / "schema.sql"
SAIDA_COMPLETO = RAIZ / "database" / "banco_completo.sql"

CABECALHO = """SET NAMES utf8mb4;

DROP DATABASE IF EXISTS confeccoes;
CREATE DATABASE IF NOT EXISTS confeccoes CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE confeccoes;
"""


def versao(arquivo: Path) -> int:
    return int(re.match(r"V(\d+)__", arquivo.name).group(1))


def ler(arquivo: Path) -> str:
    texto = arquivo.read_text(encoding="utf-8").replace("\r\n", "\n")
    texto = re.sub(r"(?m)^USE confeccoes;\n", "", texto)
    texto = re.sub(r"(?m)^SET NAMES utf8mb4;\n", "", texto)
    return texto.strip("\n") + "\n"


def main() -> None:
    migracoes = sorted(MIGRACOES.glob("V*__*.sql"), key=versao)
    if not migracoes:
        raise SystemExit(f"Nenhuma migração encontrada em {MIGRACOES}")
    estrutura = CABECALHO + "".join("\n" + ler(m) for m in migracoes)
    SAIDA_SCHEMA.write_text(estrutura, encoding="utf-8", newline="\n")
    completo = estrutura + "".join("\n" + ler(arquivo) for arquivo in DADOS_E_EXEMPLOS)
    SAIDA_COMPLETO.write_text(completo, encoding="utf-8", newline="\n")
    print(f"{SAIDA_SCHEMA.name} e {SAIDA_COMPLETO.name} gerados a partir de {len(migracoes)} migrações.")


if __name__ == "__main__":
    main()
