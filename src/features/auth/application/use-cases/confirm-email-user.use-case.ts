import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByConfirmationCode(
      command.code,
    );

    return await this.usersRepository.updateConfirmStatus(user!._id);
  }
}
