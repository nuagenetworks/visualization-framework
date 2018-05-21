export const successResponse = function (res, results) {
  return res.json({
      status: "success",
      results: results
  });
}
