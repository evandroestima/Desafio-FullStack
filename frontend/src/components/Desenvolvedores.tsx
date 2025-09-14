import React, { useState, useEffect, useMemo } from "react";
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
  TableSortLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { API_URL } from "../api";
// Define the types and API URL
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

// Helper functions for stable sorting
type Order = "asc" | "desc";
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

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

  // State for sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Desenvolvedor>("nome");

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

  // Handle sort request
  const handleRequestSort = (property: keyof Desenvolvedor) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create a combined list of developers with their level names for sorting
  const desenvolvedoresWithNivel = useMemo(() => {
    return desenvolvedores.map((dev) => ({
      ...dev,
      nivel_nome: niveis.find((n) => n.id === dev.nivel_id)?.nivel || "N/A",
    }));
  }, [desenvolvedores, niveis]);

  // Sort the developers
  const sortedDesenvolvedores = useMemo(() => {
    // A temporary array is needed to perform the sorting based on the nivel_nome
    if (orderBy === "nivel_id") {
      return stableSort(
        desenvolvedoresWithNivel,
        getComparator(order, "nivel_nome")
      );
    }
    return stableSort(desenvolvedoresWithNivel, getComparator(order, orderBy));
  }, [desenvolvedoresWithNivel, order, orderBy]);

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
      alert("Desenvolvedor salvo com sucesso!");
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
      alert("Desenvolvedor excluído com sucesso!");
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
              <TableCell sortDirection={orderBy === "id" ? order : false}>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleRequestSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "nome" ? order : false}>
                <TableSortLabel
                  active={orderBy === "nome"}
                  direction={orderBy === "nome" ? order : "asc"}
                  onClick={() => handleRequestSort("nome")}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "sexo" ? order : false}>
                <TableSortLabel
                  active={orderBy === "sexo"}
                  direction={orderBy === "sexo" ? order : "asc"}
                  onClick={() => handleRequestSort("sexo")}
                >
                  Sexo
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "data_nascimento" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "data_nascimento"}
                  direction={orderBy === "data_nascimento" ? order : "asc"}
                  onClick={() => handleRequestSort("data_nascimento")}
                >
                  Data Nascimento
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "idade" ? order : false}>
                <TableSortLabel
                  active={orderBy === "idade"}
                  direction={orderBy === "idade" ? order : "asc"}
                  onClick={() => handleRequestSort("idade")}
                >
                  Idade
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "hobby" ? order : false}>
                <TableSortLabel
                  active={orderBy === "hobby"}
                  direction={orderBy === "hobby" ? order : "asc"}
                  onClick={() => handleRequestSort("hobby")}
                >
                  Hobby
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "nivel_id" ? order : false}>
                <TableSortLabel
                  active={orderBy === "nivel_id"}
                  direction={orderBy === "nivel_id" ? order : "asc"}
                  onClick={() => handleRequestSort("nivel_id")}
                >
                  Nível
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDesenvolvedores.length > 0 ? (
              sortedDesenvolvedores.map((dev) => (
                <TableRow key={dev.id}>
                  <TableCell>{dev.id}</TableCell>
                  <TableCell>{dev.nome}</TableCell>
                  <TableCell>{dev.sexo}</TableCell>
                  <TableCell>{dev.data_nascimento}</TableCell>
                  <TableCell>{dev.idade}</TableCell>
                  <TableCell>{dev.hobby}</TableCell>
                  <TableCell>{dev.nivel_nome}</TableCell>
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
