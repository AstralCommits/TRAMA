
package br.com.trama.controller;

import br.com.trama.dto.VendaRequest;
import br.com.trama.dto.VendaResponse;
import br.com.trama.service.VendaService;
import br.com.trama.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/vendas")
@Tag(name = "Vendas", description = "Gerenciamento de lançamentos mensais de vendas.")
public class VendaController {

    private final VendaService service;

    public VendaController(VendaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPRESARIO')")
    @Operation(
            summary = "Cadastrar venda",
            description = "Registra um lançamento mensal de vendas para uma confecção e categoria."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Venda cadastrada com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VendaResponse.class),
                            examples = @ExampleObject(
                                    name = "Venda cadastrada",
                                    value = """
                                            {
                                              "idLancamento": 101,
                                              "mesAno": "2025-03",
                                              "quantidade": 120,
                                              "faturamento": 15000.00,
                                              "origem": "MANUAL",
                                              "origemDado": "ENTREVISTA",
                                              "nomeFonte": "Entrevista com lojistas da feira de Caruaru",
                                              "status": "ATIVO",
                                              "idConfeccao": 1,
                                              "confeccao": "Confecção Exemplo",
                                              "idCategoria": 1,
                                              "categoria": "Jeans"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados inválidos.",
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
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Usuário sem permissão.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<VendaResponse> criar(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados necessários para cadastrar uma venda.",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Nova venda",
                                    value = """
                                            {
                                              "idConfeccao": 1,
                                              "idCategoria": 1,
                                              "mesAno": "2025-03",
                                              "quantidade": 120,
                                              "faturamento": 15000.00,
                                              "origem": "MANUAL",
                                              "origemDado": "ENTREVISTA",
                                              "nomeFonte": "Entrevista com lojistas da feira de Caruaru"
                                            }
                                            """
                            )
                    )
            )
            @Valid @RequestBody VendaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        VendaResponse response = service.criar(request, principal);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.idLancamento())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar vendas",
            description = "Lista os lançamentos de vendas, permitindo filtrar por categoria, confecção e mês."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de vendas retornada com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = VendaResponse.class)
                            ),
                            examples = @ExampleObject(
                                    name = "Lista de vendas",
                                    value = """
                                            [
                                              {
                                                "idLancamento": 101,
                                                "mesAno": "2025-03",
                                                "quantidade": 120,
                                                "faturamento": 15000.00,
                                                "origem": "MANUAL",
                                                "origemDado": "ENTREVISTA",
                                                "nomeFonte": "Entrevista com lojistas da feira de Caruaru",
                                                "status": "ATIVO",
                                                "idConfeccao": 1,
                                                "confeccao": "Confecção Exemplo",
                                                "idCategoria": 1,
                                                "categoria": "Jeans"
                                              }
                                            ]
                                            """
                            )
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
    public List<VendaResponse> listar(
            @Parameter(description = "Filtrar pelo identificador da categoria.", example = "1")
            @RequestParam(required = false) Long categoria,

            @Parameter(description = "Filtrar pelo identificador da confecção.", example = "1")
            @RequestParam(required = false) Long confeccao,

            @Parameter(description = "Filtrar pelo mês de referência no formato AAAA-MM.", example = "2025-03")
            @RequestParam(required = false) String mesAno,

            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return service.listar(categoria, confeccao, mesAno, principal);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar venda por ID",
            description = "Retorna os detalhes de um lançamento de venda específico."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Venda encontrada com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VendaResponse.class),
                            examples = @ExampleObject(
                                    name = "Venda encontrada",
                                    value = """
                                            {
                                              "idLancamento": 101,
                                              "mesAno": "2025-03",
                                              "quantidade": 120,
                                              "faturamento": 15000.00,
                                              "origem": "MANUAL",
                                              "origemDado": "ENTREVISTA",
                                              "nomeFonte": "Entrevista com lojistas da feira de Caruaru",
                                              "status": "ATIVO",
                                              "idConfeccao": 1,
                                              "confeccao": "Confecção Exemplo",
                                              "idCategoria": 1,
                                              "categoria": "Jeans"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Usuário não autenticado.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Venda não encontrada.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public VendaResponse buscar(
            @Parameter(description = "Identificador do lançamento.", example = "101")
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return service.buscar(id, principal);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Atualizar venda",
            description = "Atualiza os dados de um lançamento de venda existente."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Venda atualizada com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VendaResponse.class),
                            examples = @ExampleObject(
                                    name = "Venda atualizada",
                                    value = """
                                            {
                                              "idLancamento": 101,
                                              "mesAno": "2025-03",
                                              "quantidade": 150,
                                              "faturamento": 18000.00,
                                              "origem": "MANUAL",
                                              "origemDado": "ENTREVISTA",
                                              "nomeFonte": "Entrevista atualizada com lojistas de Caruaru",
                                              "status": "ATIVO",
                                              "idConfeccao": 1,
                                              "confeccao": "Confecção Exemplo",
                                              "idCategoria": 1,
                                              "categoria": "Jeans"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados inválidos.",
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
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Usuário sem permissão.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Venda não encontrada.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public VendaResponse atualizar(
            @Parameter(description = "Identificador do lançamento.", example = "101")
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Novos dados da venda.",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Atualização de venda",
                                    value = """
                                            {
                                              "idConfeccao": 1,
                                              "idCategoria": 1,
                                              "mesAno": "2025-03",
                                              "quantidade": 150,
                                              "faturamento": 18000.00,
                                              "origem": "MANUAL",
                                              "origemDado": "ENTREVISTA",
                                              "nomeFonte": "Entrevista atualizada com lojistas de Caruaru"
                                            }
                                            """
                            )
                    )
            )
            @Valid @RequestBody VendaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return service.atualizar(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPRESARIO')")
    @Operation(
            summary = "Cancelar venda",
            description = "Cancela um lançamento de venda existente."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Venda cancelada com sucesso. Não há conteúdo na resposta."
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Usuário não autenticado.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Usuário sem permissão.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Venda não encontrada.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<Void> cancelar(
            @Parameter(description = "Identificador do lançamento a cancelar.", example = "101")
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        service.cancelar(id, principal);

        return ResponseEntity.noContent().build();
    }
}
