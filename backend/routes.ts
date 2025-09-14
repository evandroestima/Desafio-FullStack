import express, { Request, Response, Router } from "express";
import { dbPromise, isDatabaseConnected } from "./dbConnection";

const router: Router = express.Router();

router.get("/healthcheck", async (req: Request, res: Response) => {
  if (await isDatabaseConnected()) {
    res.status(200).json({
      message: "Database connection successful!",
    });
  } else {
    res.status(500).json({
      message: "Failed to connect to the database.",
    });
  }
});

router.post("/niveis", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { nivel } = req.body;
    const result = await db.run("INSERT INTO nivel (nivel) VALUES (?)", nivel);
    res.status(201).json({ id: result.lastID, nivel });
  } catch (err) {
    res.status(400).json({ error: err });
  }
});
router.delete("/niveis/:id", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    await db.run("DELETE FROM nivel WHERE id = ?", id);
    res.status(200).json({ message: "Nivel deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete nivel" });
  }
});
router.get("/niveis", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const niveis = await db.all("SELECT * FROM nivel");
    res.status(200).json(niveis);
  } catch (error) {
    res.status(404).json({ error: "Failed to fetch niveis" });
  }
});
router.put("/niveis/:id", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { nivel } = req.body;
    await db.run("UPDATE nivel SET nivel = ? WHERE id = ?", [nivel, id]);
    res.status(200).json({ id, nivel });
  } catch (error) {
    res.status(400).json({ error: "Failed to update nivel" });
  }
});
router.post("/desenvolvedores", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { nome, sexo, data_nascimento, hobby, nivel_id } = req.body;

    const idade =
      new Date().getFullYear() - new Date(data_nascimento).getFullYear();

    const result = await db.run(
      "INSERT INTO desenvolvedor (nome, sexo, data_nascimento, hobby, nivel_id) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, sexo, data_nascimento, idade, hobby, nivel_id]
    );
    res.status(201).json({
      id: result.lastID,
      nome,
      sexo,
      data_nascimento,
      idade,
      hobby,
      nivel_id,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to create desenvolvedor" });
  }
});
router.delete("/desenvolvedores/:id", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    await db.run("DELETE FROM desenvolvedor WHERE id = ?", id);
    res.status(200).json({ message: "Desenvolvedor deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete desenvolvedor" });
  }
});
router.put("/desenvolvedores/:id", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { nome, sexo, data_nascimento, hobby, nivel_id } = req.body;

    const idade =
      new Date().getFullYear() - new Date(data_nascimento).getFullYear();

    await db.run(
      "UPDATE desenvolvedor SET nome = ?, sexo = ?, data_nascimento = ?, idade = ?, hobby = ?, nivel_id = ? WHERE id = ?",
      [nome, sexo, data_nascimento, idade, hobby, nivel_id, id]
    );
    res.status(200).json({
      id,
      nome,
      sexo,
      data_nascimento,
      idade,
      hobby,
      nivel_id,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to update desenvolvedor" });
  }
});
router.get("/desenvolvedores", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const desenvolvedores = await db.all(
      `SELECT d.*, n.nivel FROM desenvolvedor d LEFT JOIN nivel n ON d.nivel_id = n.id`
    );
    res.status(200).json(desenvolvedores);
  } catch (error) {
    res.status(404).json({ error: "Failed to fetch desenvolvedores" });
  }
});

export default router;
