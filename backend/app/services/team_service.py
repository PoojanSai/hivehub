from sqlalchemy.orm import Session, joinedload
from ..db.models import Team, TeamMember
from ..schemas.team import TeamCreate


def create_team(db: Session, data: TeamCreate) -> Team:
    team = Team(name=data.name, color=data.color, owner_id=data.owner_id)
    db.add(team)
    db.flush()
    member = TeamMember(team_id=team.id, user_id=data.owner_id)
    db.add(member)
    db.commit()
    db.refresh(team)
    return team


def get_teams(db: Session) -> list[Team]:
    return (
        db.query(Team)
        .options(
            joinedload(Team.members),
            joinedload(Team.projects),
        )
        .all()
    )


def get_team(db: Session, team_id: int) -> Team | None:
    return (
        db.query(Team)
        .options(joinedload(Team.members), joinedload(Team.projects))
        .filter(Team.id == team_id)
        .first()
    )


def add_member(db: Session, team_id: int, user_id: int) -> TeamMember:
    member = TeamMember(team_id=team_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member
