export function baseParse(content: string) {
  //
  console.log(content);

  return {
    children: [
      {
        type: "interpolation",
        content: {
          type: "simple_expression",
          content: "message",
        },
      },
    ],
  };
}
