export const success = (
  res: any,
  data: any,
  message = "Success",
  status = 200
) => {

  return res.status(status).json({
    success: true,
    message,
    data,
  });

};

export const failure = (
  res: any,
  message = "Failed",
  status = 400
) => {

  return res.status(status).json({
    success: false,
    message,
  });

};