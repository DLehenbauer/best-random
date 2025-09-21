# GF2

## Hunt 1 (64 bit x 2)

```py
    # Helper to perform an operation chosen by integer code:
    #   0: shr (>>)
    #   1: shl (<<)
    #   2: rol (rotate left)
    def o(code, value, shift_amount):
        if code == 0:
            return a.shr(value, shift_amount)
        elif code == 1:
            return a.shl(value, shift_amount)
        elif code == 2:
            return a.rol(value, shift_amount)
        else:
            raise ValueError(f"Invalid operation code: {code}")

    # Computes the next state of our Xorshift generator
    def next_state_func(s):
        si0 = s[i[0]]
        si1 = s[i[1]]
        si2 = s[i[2]]
        si3 = s[i[3]]

        o0 = ops[0]
        o1 = ops[1]

        c0 = c[0]
        c1 = c[1]

        s[0] = si0 ^ o(o0, si1, c0)
        s[1] = si2 ^ o(o1, si3, c1)

        return s
```

### Results

```
i=(0, 1, 0, 1) ops=(2, 0) c=(25, 41): OK
i=(0, 1, 0, 1) ops=(2, 0) c=(29, 31): OK
i=(0, 1, 0, 1) ops=(2, 0) c=(29, 33): OK
i=(0, 1, 0, 1) ops=(2, 0) c=(35, 9): OK
i=(0, 1, 0, 1) ops=(2, 0) c=(37, 29): OK
i=(0, 1, 0, 1) ops=(2, 1) c=(27, 29): OK
i=(0, 1, 0, 1) ops=(2, 1) c=(29, 9): OK
i=(0, 1, 0, 1) ops=(2, 1) c=(35, 31): OK
i=(0, 1, 0, 1) ops=(2, 1) c=(35, 33): OK
i=(0, 1, 0, 1) ops=(2, 1) c=(39, 41): OK
i=(1, 0, 0, 0) ops=(2, 0) c=(35, 33): OK
i=(1, 0, 0, 0) ops=(2, 0) c=(41, 29): OK
i=(1, 0, 0, 0) ops=(2, 0) c=(57, 19): OK
i=(1, 0, 0, 0) ops=(2, 1) c=(7, 19): OK
i=(1, 0, 0, 0) ops=(2, 1) c=(23, 29): OK
i=(1, 0, 0, 0) ops=(2, 1) c=(29, 33): OK
i=(1, 0, 1, 0) ops=(0, 2) c=(9, 35): OK
i=(1, 0, 1, 0) ops=(0, 2) c=(29, 37): OK
i=(1, 0, 1, 0) ops=(0, 2) c=(31, 29): OK
i=(1, 0, 1, 0) ops=(0, 2) c=(33, 29): OK
i=(1, 0, 1, 0) ops=(0, 2) c=(41, 25): OK
i=(1, 0, 1, 0) ops=(1, 2) c=(9, 29): OK
i=(1, 0, 1, 0) ops=(1, 2) c=(29, 27): OK
i=(1, 0, 1, 0) ops=(1, 2) c=(31, 35): OK
i=(1, 0, 1, 0) ops=(1, 2) c=(33, 35): OK
i=(1, 0, 1, 0) ops=(1, 2) c=(41, 39): OK
i=(1, 1, 0, 1) ops=(0, 2) c=(19, 57): OK
i=(1, 1, 0, 1) ops=(0, 2) c=(29, 41): OK
i=(1, 1, 0, 1) ops=(0, 2) c=(33, 35): OK
i=(1, 1, 0, 1) ops=(1, 2) c=(19, 7): OK
i=(1, 1, 0, 1) ops=(1, 2) c=(29, 23): OK
i=(1, 1, 0, 1) ops=(1, 2) c=(33, 29): OK
```
