import { z } from "zod";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

const ParamsSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  name: z.string().optional()
});

export default Password({
  validatePasswordRequirements: (password: string) => {
    if (password.length < 6) throw new ConvexError("密码至少 6 个字符");
    if (!/[A-Z]/.test(password))
      throw new ConvexError("密码必须包含至少一个大写字母");
    if (!/[a-z]/.test(password))
      throw new ConvexError("密码必须包含至少一个小写字母");
    if (!/[0-9]/.test(password))
      throw new ConvexError("密码必须包含至少一个数字");
    // 无需 return
  },
  profile(params) {
    const { error, data } = ParamsSchema.safeParse(params);
    if (error) {
      const errorMessage = error.issues
        .map((issue) => issue.message)
        .join("\n");
      throw new ConvexError(errorMessage); // 自动返回格式化的错误
    }

    // 这里返回的会被存储到数据库
    let result: {email: string; name?:string} = {email: data.email}
    if(data.name) {
      result = {...result, name: data.name}
    }
    return result;
  },
});
