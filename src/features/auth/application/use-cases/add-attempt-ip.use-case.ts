import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttemptsRepository } from '../../infrastructure/attempts.repository';
import { AttemptModel } from '../../api/models/attempt.model';

export class AddAttemptCommand {
  constructor(public readonly attempt: AttemptModel) {}
}
@CommandHandler(AddAttemptCommand)
export class AddAttemptUseCase implements ICommandHandler<AddAttemptCommand> {
  constructor(private readonly attemptsRepository: AttemptsRepository) {}

  async execute(command: AddAttemptCommand): Promise<AttemptModel> {
    return await this.attemptsRepository.addAttempt(command.attempt);
  }
}
