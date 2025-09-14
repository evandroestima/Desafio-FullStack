import {
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

type Desenvolvedor = {
  id: number;
  nome: string;
  sexo: string;
  data_nascimento: string;
  idade: number;
  hobby: string;
  nivel_id: number;
};

type Nivel = { id: number; nivel: string };

const API_URL = "http://localhost:3000";

const DesenvolvedoresPage = () => {
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentDev, setCurrentDev] = useState<Desenvolvedor | null>(null);
  const [form, setForm] = useState({
    nome: "",
    sexo: "",
    data_nascimento: "",
    hobby: "",
    nivel_id: "",
  });

  const fetchDesenvolvedores = async () => {
    try {
      const response = await fetch(`${API_URL}/desenvolvedores`);
      const data = await response.json();
      setDesenvolvedores(data);
    } catch (error) {
      console.error("Erro ao buscar desenvolvedores:", error);
    }
  };

  const fetchNiveis = async () => {
    try {
      const response = await fetch(`${API_URL}/niveis`);
      const data = await response.json();
      setNiveis(data);
    } catch (error) {
      console.error("Erro ao buscar níveis:", error);
    }
  };

  useEffect(() => {
    fetchDesenvolvedores();
    fetchNiveis();
  }, []);

  // Handlers for modal actions
  const handleOpenModal = (dev: Desenvolvedor | null = null) => {
    setCurrentDev(dev);
    setForm(
      dev
        ? {
            nome: dev.nome,
            sexo: dev.sexo,
            data_nascimento: dev.data_nascimento,
            hobby: dev.hobby,
            nivel_id: String(dev.nivel_id),
          }
        : {
            nome: "",
            sexo: "",
            data_nascimento: "",
            hobby: "",
            nivel_id: "",
          }
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentDev(null);
    setForm({
      nome: "",
      sexo: "",
      data_nascimento: "",
      hobby: "",
      nivel_id: "",
    });
  };

  const handleOpenConfirm = (dev: Desenvolvedor) => {
    setCurrentDev(dev);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setCurrentDev(null);
  };

  const handleAddOrEdit = async () => {
    try {
      const payload = {
        idade:
          new Date().getFullYear() -
          new Date(form.data_nascimento).getFullYear(),
        ...form,
      };

      if (currentDev) {
        await fetch(`${API_URL}/desenvolvedores/${currentDev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_URL}/desenvolvedores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchDesenvolvedores();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar desenvolvedor:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentDev) return;
    try {
      await fetch(`${API_URL}/desenvolvedores/${currentDev.id}`, {
        method: "DELETE",
      });
      fetchDesenvolvedores();
      handleCloseConfirm();
    } catch (error) {
      console.error("Erro ao deletar desenvolvedor:", error);
    }
  };

  return (
    <div>
      <div
        className="flex justify-between items-center"
        style={styles.pageTitle}
      >
        <Typography variant="h4" component="h1">
          Lista de Desenvolvedores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Adicionar Desenvolvedor
        </Button>
      </div>

      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-200">
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>Data Nascimento</TableCell>
              <TableCell>Idade</TableCell>
              <TableCell>Hobby</TableCell>
              <TableCell>Nível</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {desenvolvedores.length > 0 ? (
              desenvolvedores.map((dev) => (
                <TableRow key={dev.id}>
                  <TableCell>{dev.id}</TableCell>
                  <TableCell>{dev.nome}</TableCell>
                  <TableCell>{dev.sexo}</TableCell>
                  <TableCell>{dev.data_nascimento}</TableCell>
                  <TableCell>{dev.idade}</TableCell>
                  <TableCell>{dev.hobby}</TableCell>
                  <TableCell>
                    {niveis.find((n) => n.id === dev.nivel_id)?.nivel || "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenModal(dev)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenConfirm(dev)}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum desenvolvedor cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {currentDev ? "Editar Desenvolvedor" : "Adicionar Desenvolvedor"}
        </DialogTitle>
        <DialogContent className="grid grid-cols-2 gap-4">
          <TextField
            margin="dense"
            label="Nome"
            fullWidth
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Sexo"
            fullWidth
            value={form.sexo}
            onChange={(e) => setForm({ ...form, sexo: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Data de Nascimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.data_nascimento}
            inputProps={{
              max: new Date().toISOString().split("T")[0],
            }}
            onChange={(e) =>
              setForm({ ...form, data_nascimento: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Idade"
            type="number"
            fullWidth
            value={
              form.data_nascimento
                ? new Date().getFullYear() -
                  new Date(form.data_nascimento).getFullYear()
                : ""
            }
            disabled
          />
          <TextField
            margin="dense"
            label="Hobby"
            fullWidth
            value={form.hobby}
            onChange={(e) => setForm({ ...form, hobby: e.target.value })}
          />
          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel>Nível</InputLabel>
            <Select
              value={form.nivel_id}
              label="Nível"
              onChange={(e) => setForm({ ...form, nivel_id: e.target.value })}
            >
              {niveis.map((nivel) => (
                <MenuItem key={nivel.id} value={nivel.id}>
                  {nivel.nivel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddOrEdit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja excluir o desenvolvedor "
            {currentDev?.nome}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DesenvolvedoresPage;

const styles = {
  title: {
    flexGrow: 1,
  },

  tableContainer: {
    marginBottom: "2rem",
  },
  modal: {
    padding: "1rem",
    borderRadius: "8px",
  },
  formControl: {
    minWidth: 120,
    marginTop: "1rem",
  },
  pageTitle: {
    marginBottom: "1rem",
  },
  button: {
    margin: "0 0.5rem",
  },
};
