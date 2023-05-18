import enum
from datetime import (
    datetime,
)
from typing import (
    List,
    Optional,
)

from dateutil.relativedelta import (
    relativedelta,
)
from pydantic import (
    BaseModel,
)
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.ext.hybrid import (
    hybrid_property,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from database.db_models import (
    Base,
    MixinAsDict,
)


class Department(MixinAsDict, Base):
    """database model"""

    __tablename__ = "department"

    # [MANAGED FIELDS] ###################################################################
    handle: Mapped[str] = mapped_column(String(20), primary_key=True)

    # [USER CHANGEABLE FIELDS] ###########################################################
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)

    # [RELATIONAL FK FIELDS] #############################################################
    # back reference from DepartmentMembership
    memberships: Mapped[List["DepartmentMembership"]] = relationship(
        "DepartmentMembership", back_populates="department"
    )

    # back reference from Project
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="department"
    )

    def __repr__(self) -> str:
        return f"Department(id={self.handle!r}, name={self.name!r})"


class Role(enum.Enum):
    TEAMLEAD = "Teamlead"
    PRESIDENT = "President"
    MEMBER = "Member"
    ALUMNI = "Alumni"
    APPLICANT = "Applicant"


class JobHistoryElement(BaseModel):
    employer: str
    position: str
    date_from: str
    date_to: str

    @classmethod
    def dummy(cls) -> "JobHistoryElement":
        return JobHistoryElement(
            employer="Google",
            position="SWE Intern",
            date_from="15.01.2023",
            date_to="31.03.2023",
        )

    class Config:
        schema_extra = {
            "example": {
                "employer": "Google",
                "position": "SWE Intern",
                "date_from": "15.01.2023",
                "date_to": "31.03.2023",
            }
        }


# TODO: see https://sqlalchemy-imageattach.readthedocs.io/en/0.8.0/api/entity.html
# class UserPicture(Base, Image):
#     '''User's profile picture.'''
#
#     user_id = Column(Integer, ForeignKey('User.id'), primary_key=True)
#     user = relationship('User')
#
#     __tablename__ = 'user_picture'


class Profile(MixinAsDict, Base):
    """database model"""

    __tablename__ = "profile"

    # [MANAGED FIELDS] ###################################################################
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    supertokens_id: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=True
    )

    # [USER CHANGEABLE FIELDS] ###########################################################
    email: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)

    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)

    birthday = Column(DateTime, nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # TODO: see https://sqlalchemy-imageattach.readthedocs.io/en/0.8.0/api/entity.html
    # profile_picture

    activity_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    degree_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    degree_name: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    degree_semester: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    degree_semester_last_change_date = Column(DateTime, nullable=True)
    university: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)

    # format: csv list of <employer:position:from:to>,
    job_history: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # [SUPERVISOR CHANGEABLE FIELDS] #####################################################
    time_joined = Column(DateTime, nullable=True)

    # [RELATIONAL FK FIELDS] #############################################################
    # back reference from SocialNetwork
    social_networks: Mapped[List["SocialNetwork"]] = relationship(
        "SocialNetwork", back_populates="profile"
    )

    # back reference from DepartmentMembership
    department_memberships: Mapped[List["DepartmentMembership"]] = relationship(
        "DepartmentMembership", back_populates="profile"
    )

    # back reference from ProjectMembership
    project_memberships: Mapped[List["ProjectMembership"]] = relationship(
        "ProjectMembership", back_populates="profile"
    )

    # back reference from CertificationRequest
    certification_requests: Mapped[List["CertificationRequest"]] = relationship(
        "CertificationRequest", back_populates="profile"
    )

    # back reference from Certificate
    received_certificates: Mapped[List["Certificate"]] = relationship(
        "Certificate", back_populates="profile", foreign_keys="Certificate.profile_id"
    )

    # back reference from Certificate
    issued_certificates: Mapped[List["Certificate"]] = relationship(
        "Certificate", back_populates="issuer", foreign_keys="Certificate.issuer_id"
    )

    # [AUTOMATIC/COMPUTED FIELDS] ########################################################
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    @hybrid_property
    def tum_ai_semester(self):
        """automatically computed by python from db model"""
        return relativedelta(datetime.now(), self.date_joined).years * 2

    @hybrid_property
    def full_name(self):
        """automatically computed by python from db model"""
        return f"{self.first_name} {self.last_name}"

    @hybrid_property
    def decoded_job_history(self):
        job_history = []
        if job_history and len(job_history) > 0:
            for entry in f"{job_history}".split(","):
                fields = entry.split(":")
                if len(fields) != 4:
                    continue
                job_history.append(
                    JobHistoryElement(
                        employer=fields[0],
                        position=fields[1],
                        date_from=fields[2],
                        date_to=fields[3],
                    )
                )
        return job_history

    def __repr__(self) -> str:
        return f"Profile(id={self.id}, fullname={self.full_name})"

    #
    @classmethod
    def encode_job_history(cls, job_history: JobHistoryElement) -> Optional[str]:
        # encode job_history in csv of <employer:position:from:to>
        encoded_history = ""
        for hist in job_history:
            # TODO abstraction
            encoded_history = (
                f"{encoded_history}{hist.employer}:{hist.position}:"
                + f"{hist.date_from}:{hist.date_to},"
            )
        if len(encoded_history) > 0:
            encoded_history = encoded_history[:-1]  # strip trailing comma
        else:
            encoded_history = None

        return encoded_history


class SocialNetworkType(enum.Enum):
    SLACK = "Slack"
    LINKEDIN = "LinkedIn"
    GITHUB = "GitHub"
    PHONENUMBER = "Phone"
    INSTAGRAM = "Instagram"
    TELEGRAM = "Telegram"
    DISCORD = "Discord"
    OTHER = "Other"


class SocialNetwork(MixinAsDict, Base):
    """database model"""

    __tablename__ = "social_network"

    # [MANAGED FIELDS] ###################################################################
    profile_id: Mapped[int] = mapped_column(
        ForeignKey(Profile.id, ondelete="CASCADE"), primary_key=True
    )
    type = Column(Enum(SocialNetworkType), primary_key=True)

    # [USER CHANGEABLE FIELDS] ###########################################################
    handle: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    link: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # [RELATIONAL FK FIELDS] #############################################################
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="social_networks", cascade="all,delete"
    )

    __table_args__ = (
        (CheckConstraint("(handle IS NULL) <> (link IS NULL)", name="handle_xor_link")),
    )

    def __repr__(self) -> str:
        return (
            f"SocialNetwork(profile_id={self.profile_id!r}, type={self.type!r}, "
            f"fullname={self.handle!r}, link={self.link!r})"
        )


class DepartmentMembership(MixinAsDict, Base):
    """database relation"""

    __tablename__ = "department_membership"

    # [MANAGED FIELDS] ###################################################################
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # [SUPERVISOR CHANGEABLE FIELDS] #####################################################
    role = Column(Enum(Role), nullable=False)
    time_from = Column(DateTime, nullable=True)
    time_to = Column(DateTime, nullable=True)

    # [RELATIONAL FK FIELDS] #############################################################
    profile_id: Mapped[int] = mapped_column(
        ForeignKey(Profile.id, ondelete="CASCADE"), nullable=False
    )
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="department_memberships", cascade="all,delete"
    )

    department_handle: Mapped[str] = mapped_column(
        ForeignKey(Department.handle), nullable=False
    )
    department: Mapped["Department"] = relationship(
        "Department", back_populates="memberships"
    )

    def __repr__(self) -> str:
        return (
            f"DepartmentMembership(id={self.profile_id!r} "
            + f"({self.profile.full_name}), department_handle={self.department_handle!r})"
        )