import { View, Text, Button, TextInput } from "react-native";
import React, { useState } from "react";
import TranslateSheet from "translate-sheet";

const TestInput = () => {
  const [testVal, setTestVal] = useState<boolean>(true);
  const [testInputVal, setTestInputVal] = useState<string>("Test");
  return (
    <View style={{ gap: 30 }}>
      <Button
        title={translations.buttonLabel}
        onPress={() => {
          setTestVal(!testVal);
        }}
      />
      <Text>{translations.buttonVal({ value: testVal })}</Text>
      <TextInput
        style={{
          height: 50,
          width: "100%",
          borderColor: "blue",
          borderWidth: 2,
          padding: 5,
        }}
        value={testInputVal}
        onChangeText={setTestInputVal}
      />
      <Text>{translations.inputVal({ value: testInputVal })}</Text>
    </View>
  );
};

const translations = TranslateSheet.create("TestInput", {
  buttonLabel: "PRESS ME",
  buttonVal: "The value of the boolean is: {{value}}",
  inputVal: "The value of the testInput is: {{value}}",
});

export default TestInput;
