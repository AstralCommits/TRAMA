import sqlite3
from pathlib import Path

PASTA = Path(__file__).resolve().parent
SEEDS = PASTA.parent / "seeds"
BANCO = PASTA / "extensao.db"

def ler_sem_use(caminho):
    return "\n".join(
        linha for linha in caminho.read_text(encoding="utf-8").splitlines()
        if not linha.strip().upper().startswith("USE ")
    )


inserts = ler_sem_use(SEEDS / "inserts.sql")

BANCO.unlink(missing_ok=True)
con = sqlite3.connect(BANCO)
con.execute("PRAGMA foreign_keys = ON")
con.executescript((PASTA / "schema_sqlite.sql").read_text(encoding="utf-8"))
con.executescript(inserts)

problemas = con.execute("PRAGMA foreign_key_check").fetchall()
integridade = con.execute("PRAGMA integrity_check").fetchone()[0]
con.close()

if problemas or integridade != "ok":
    raise SystemExit(f"Falhou: foreign_key_check={problemas} integrity_check={integridade}")
print(f"{BANCO.name} gerado em {BANCO}")
