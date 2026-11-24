export function apiError(
  status: number,
  message: string
): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export function withApi<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Response | Promise<Response>
): (...args: TArgs) => Promise<Response> {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("Erro durante a execução da API:", error);

      return apiError(500, "Internal server error");
    }
  };
}
