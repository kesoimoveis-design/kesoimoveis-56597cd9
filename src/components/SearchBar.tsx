import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [tipo, setTipo] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (finalidade) params.append("finalidade", finalidade);
    if (tipo) params.append("tipo", tipo);
    
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-medium">
      <div className="grid gap-4 md:grid-cols-5">
        {/* Localização */}
        <div className="md:col-span-2">
          <Input
            placeholder="Cidade ou bairro"
            className="h-12"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Finalidade */}
        <div>
          <Select value={finalidade} onValueChange={setFinalidade}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Finalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo */}
        <div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="terreno">Terreno</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buscar */}
        <div>
          <Button className="h-12 w-full" size="lg" onClick={handleSearch}>
            <Search className="mr-2 h-5 w-5" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
