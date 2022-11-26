export const reducer = (state, action) => {
  const { validationResult, inputId, inputValue } = action;

  const updatedValidities = {
    ...state.inputValidities,
    [inputId]: validationResult,
  };
  const updatedValues = {
    ...state.inputValues,
    [inputId]: inputValue,
  };

  let updatedFormIsValid = true;

  for (const key in updatedValidities) {
    if (updatedValidities[key] !== undefined) {
      updatedFormIsValid = false;
      break;
    }
  }

  return {
    inputValues: updatedValues,
    inputValidities: updatedValidities,
    formIsValid: updatedFormIsValid,
  };
};

// const initialState = {
//   inputValidities: {
//     firstName: false,
//     lastName: false,
//     email: false,
//     password: false,
//   },
//   formIsValid: false,
// };
