
package br.com.trama.controller;

import br.com.trama.dto.CategoriaIndicadorDTO;
import br.com.trama.dto.IndicadorResponseDTO;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.IndicadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/indicadores")
@Tag(name = "Indicadores", description = "Consulta de indicadores de vendas e tendências por categoria.")
public class IndicadorController {

    private final IndicadorService indicadorService;

    public IndicadorController(IndicadorService indicadorService) {
        this.indicadorService = indicadorService;
    }

    @GetMapping
    @Operation(
            summary = "Consultar indicadores de vendas",
            description = """
                    Retorna os indicadores de vendas de um período, incluindo faturamento,
                    quantidade de peças, ticket médio, comparação com o período anterior
                    e desempenho por categoria.

                    Os períodos devem utilizar o formato AAAA-MM.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Indicadores calculados com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IndicadorResponseDTO.class),
                            examples = @ExampleObject(
                                    name = "Indicadores de fevereiro de 2025",
                                    value = """
                                            {
                                              "inicio": "2025-02",
                                              "fim": "2025-02",
                                              "quantidadeTotal": 25,
                                              "faturamentoTotal": 2510.00,
                                              "faturamentoMedio": 836.67,
                                              "quantidadeLancamentos": 3,
                                              "categoriaId": null,
                                              "cidade": "Toritama",
                                              "pecasVendidas": 25,
                                              "ticketMedio": 100.40,
                                              "inicioAnterior": "2025-01",
                                              "fimAnterior": "2025-01",
                                              "faturamentoTotalAnterior": 2500.00,
                                              "pecasVendidasAnterior": 25,
                                              "variacaoPercentual": 0.40,
                                              "categorias": [
                                                {
                                                  "idCategoria": 1,
                                                  "categoria": "Jeans",
                                                  "faturamento": 1200.00,
                                                  "pecasVendidas": 12,
                                                  "faturamentoAnterior": 1000.00,
                                                  "pecasVendidasAnterior": 10,
                                                  "variacaoPercentual": 20.00,
                                                  "classificacao": "ALTA"
                                                },
                                                {
                                                  "idCategoria": 2,
                                                  "categoria": "Infantil",
                                                  "faturamento": 510.00,
                                                  "pecasVendidas": 5,
                                                  "faturamentoAnterior": 500.00,
                                                  "pecasVendidasAnterior": 5,
                                                  "variacaoPercentual": 2.00,
                                                  "classificacao": "ESTAVEL"
                                                },
                                                {
                                                  "idCategoria": 3,
                                                  "categoria": "Praia",
                                                  "faturamento": 800.00,
                                                  "pecasVendidas": 8,
                                                  "faturamentoAnterior": 1000.00,
                                                  "pecasVendidasAnterior": 10,
                                                  "variacaoPercentual": -20.00,
                                                  "classificacao": "QUEDA"
                                                }
                                              ],
                                              "categoriaLider": {
                                                "categoria": "Jeans",
                                                "faturamento": 1200.00
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Período inválido ou data final anterior à inicial.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Usuário não autenticado.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<IndicadorResponseDTO> buscarIndicadores(
            @Parameter(description = "Mês inicial da consulta no formato AAAA-MM.", example = "2025-02")
            @RequestParam String inicio,

            @Parameter(description = "Mês final da consulta no formato AAAA-MM.", example = "2025-02")
            @RequestParam String fim,

            @Parameter(description = "Identificador opcional da categoria.", example = "1")
            @RequestParam(required = false) Long categoriaId,

            @Parameter(description = "Cidade utilizada como filtro.", example = "Toritama")
            @RequestParam(required = false) String cidade,

            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return ResponseEntity.ok(
                indicadorService.buscarIndicadores(inicio, fim, categoriaId, cidade, principal)
        );
    }

    @GetMapping("/tendencias")
    @Operation(
            summary = "Consultar tendências por categoria",
            description = """
                    Retorna a evolução das categorias no período selecionado,
                    comparando faturamento e quantidade de peças com o período anterior.

                    Classificações possíveis: ALTA, QUEDA, ESTAVEL e SEM_BASE.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tendências calculadas com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = CategoriaIndicadorDTO.class)
                            ),
                            examples = @ExampleObject(
                                    name = "Tendências de fevereiro de 2025",
                                    value = """
                                            [
                                              {
                                                "idCategoria": 1,
                                                "categoria": "Jeans",
                                                "faturamento": 1200.00,
                                                "pecasVendidas": 12,
                                                "faturamentoAnterior": 1000.00,
                                                "pecasVendidasAnterior": 10,
                                                "variacaoPercentual": 20.00,
                                                "classificacao": "ALTA"
                                              },
                                              {
                                                "idCategoria": 2,
                                                "categoria": "Infantil",
                                                "faturamento": 510.00,
                                                "pecasVendidas": 5,
                                                "faturamentoAnterior": 500.00,
                                                "pecasVendidasAnterior": 5,
                                                "variacaoPercentual": 2.00,
                                                "classificacao": "ESTAVEL"
                                              },
                                              {
                                                "idCategoria": 3,
                                                "categoria": "Praia",
                                                "faturamento": 800.00,
                                                "pecasVendidas": 8,
                                                "faturamentoAnterior": 1000.00,
                                                "pecasVendidasAnterior": 10,
                                                "variacaoPercentual": -20.00,
                                                "classificacao": "QUEDA"
                                              }
                                            ]
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Período inválido.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Usuário não autenticado.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public List<CategoriaIndicadorDTO> buscarTendencias(
            @Parameter(description = "Mês inicial da consulta no formato AAAA-MM.", example = "2025-02")
            @RequestParam String inicio,

            @Parameter(description = "Mês final da consulta no formato AAAA-MM.", example = "2025-02")
            @RequestParam String fim,

            @Parameter(description = "Cidade utilizada como filtro.", example = "Toritama")
            @RequestParam(required = false) String cidade,

            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return indicadorService.buscarTendencias(inicio, fim, cidade, principal);
    }
}
