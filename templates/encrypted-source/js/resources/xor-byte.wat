(module
  (func (export "decode") (param $byte i32) (param $mask i32) (result i32)
    local.get $byte
    local.get $mask
    i32.xor))
