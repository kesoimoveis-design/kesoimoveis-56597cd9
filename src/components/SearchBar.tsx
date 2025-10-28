import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-medium">
      <div className="grid gap-4 md:grid-cols-5">
        {/* Localização */}
        <div className="md:col-span-2">
          <Input
            placeholder="Cidade ou bairro"
            className="h-12"
          />
        </div>

        {/* Finalidade */}
        <div>
          <Select>
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
          <Select>
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
          <Button className="h-12 w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
