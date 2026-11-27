
package br.com.trama.controller;

import br.com.trama.dto.ImportacaoResponse;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.ImportacaoService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/importacoes")
@Tag(name = "Importações", description = "Importação e consulta de lançamentos mensais por arquivos CSV.")
public class ImportacaoController {

    private final ImportacaoService service;

    public ImportacaoController(ImportacaoService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Importar lançamentos por CSV",
            description = """
                    Importa lançamentos mensais a partir de um arquivo CSV.
                    O arquivo deve utilizar UTF-8 e conter os cabeçalhos obrigatórios:
                    mesAno (ou mesReferencia), quantidade, faturamento (ou valor),
                    idConfeccao, idCategoria, origemDado e nomeFonte.

                    O separador pode ser vírgula ou ponto e vírgula.
                    Os identificadores de confecção e categoria devem existir no sistema.
                    A origem da importação é definida pelo próprio sistema.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Arquivo importado com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ImportacaoResponse.class),
                            examples = @ExampleObject(
                                    name = "Importação concluída",
                                    value = """
                                            {
                                              "idImportacao": 15,
                                              "nomeArquivo": "vendas_marco_2025.csv",
                                              "dataImportacao": "2025-03-31T14:30:00",
                                              "qtdLinhas": 2,
                                              "status": "CONCLUIDA",
                                              "idUsuario": 3
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Arquivo inválido, cabeçalhos ausentes ou dados incorretos.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class),
                            examples = @ExampleObject(
                                    name = "Arquivo inválido",
                                    value = """
                                            {
                                              "type": "about:blank",
                                              "title": "Bad Request",
                                              "status": 400,
                                              "detail": "O arquivo CSV não possui os cabeçalhos obrigatórios.",
                                              "instance": "/api/importacoes",
                                              "timestamp": "2025-03-31T14:30:00"
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
                    responseCode = "403",
                    description = "Usuário sem permissão para importar os dados.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "Arquivo maior que o limite permitido de 10 MB.",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<ImportacaoResponse> importar(
            @Parameter(
                    description = """
                            Arquivo CSV em UTF-8.

                            Exemplo de conteúdo:
                            mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte
                            2025-03;120;15000.00;1;1;ENTREVISTA;Entrevista com lojistas de Caruaru
                            2025-03;80;9600.00;1;2;QUESTIONARIO;Questionário com comerciantes

                            Substitua os IDs pelos identificadores existentes no seu banco de dados.
                            """,
                    required = true,
                    schema = @Schema(type = "string", format = "binary")
            )
            @RequestPart("arquivo") MultipartFile arquivo,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        ImportacaoResponse response = service.importar(arquivo, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar importações",
            description = "Lista as importações realizadas pelo usuário autenticado. Administradores podem consultar todas."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Importações retornadas com sucesso.",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = ImportacaoResponse.class)
                            ),
                            examples = @ExampleObject(
                                    name = "Histórico de importações",
                                    value = """
                                            [
                                              {
                                                "idImportacao": 15,
                                                "nomeArquivo": "vendas_marco_2025.csv",
                                                "dataImportacao": "2025-03-31T14:30:00",
                                                "qtdLinhas": 2,
                                                "status": "CONCLUIDA",
                                                "idUsuario": 3
                                              },
                                              {
                                                "idImportacao": 16,
                                                "nomeArquivo": "vendas_abril_2025.csv",
                                                "dataImportacao": "2025-04-30T10:15:00",
                                                "qtdLinhas": 0,
                                                "status": "ERRO",
                                                "idUsuario": 3
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
    public List<ImportacaoResponse> listar(
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return service.listar(principal);
    }
}
